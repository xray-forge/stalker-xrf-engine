import { alife, clsid, level, MonsterHitInfo } from "xray16";

import {
  getObjectByStoryId,
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  IRegistryObjectState,
  registry,
} from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { ActorInventoryMenuManager, EActorMenuMode } from "@/engine/core/managers/interface/ActorInventoryMenuManager";
import { ItemUpgradesManager } from "@/engine/core/managers/interface/ItemUpgradesManager";
import { SmartTerrain, Squad } from "@/engine/core/objects";
import { ISmartTerrainJob } from "@/engine/core/objects/server/smart_terrain/types";
import { ISchemeAnimpointState, SchemeAnimpoint } from "@/engine/core/schemes/animpoint";
import { ISchemeDeathState } from "@/engine/core/schemes/death";
import { ISchemeHitState } from "@/engine/core/schemes/hit";
import { SchemeDeimos } from "@/engine/core/schemes/sr_deimos";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import {
  isDistanceBetweenObjectsGreaterOrEqual,
  isDistanceBetweenObjectsLessOrEqual,
  isHeavilyWounded,
  isObjectInZone,
  isObjectWounded,
  isPlayingSound,
  isSquadExisting,
} from "@/engine/core/utils/check/check";
import { isMonster, isStalker } from "@/engine/core/utils/check/is";
import { hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain, getObjectSquad } from "@/engine/core/utils/object";
import { captions, TCaption } from "@/engine/lib/constants/captions";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { FALSE } from "@/engine/lib/constants/words";
import {
  AlifeSimulator,
  AnyArgs,
  AnyGameObject,
  ClientObject,
  EScheme,
  LuaArray,
  Optional,
  ServerCreatureObject,
  ServerObject,
  TCount,
  TIndex,
  TName,
  TNumberId,
  TSection,
  TStringId,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern("xr_conditions.is_monster_snork", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.clsid() === clsid.snork_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_dog", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.clsid() === clsid.dog_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_psy_dog", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.clsid() === clsid.psy_dog_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_polter", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.clsid() === clsid.poltergeist_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_tushkano", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.clsid() === clsid.tushkano_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_burer", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.clsid() === clsid.burer_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_controller", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.clsid() === clsid.controller_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_flesh", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.clsid() === clsid.flesh_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_boar", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.clsid() === clsid.boar_s;
});

/**
 * todo;
 */
extern("xr_conditions.fighting_dist_ge", (first: ClientObject, second: ClientObject, params: AnyArgs): boolean => {
  return isDistanceBetweenObjectsGreaterOrEqual(first, second, params[0]);
});

/**
 * todo;
 */
extern("xr_conditions.fighting_dist_le", (first: ClientObject, second: ClientObject, params: AnyArgs): boolean => {
  return isDistanceBetweenObjectsLessOrEqual(first, second, params[0]);
});

/**
 * todo;
 */
extern("xr_conditions.enemy_in_zone", (enemy: ClientObject, npc: ClientObject, params: AnyArgs): boolean => {
  const zone: Optional<ClientObject> = registry.zones.get(params[0]);

  if (zone === null) {
    abort("Wrong zone name '%s' in enemy_in_zone function.", tostring(params[0]));
  }

  return isObjectInZone(enemy, zone);
});

/**
 * todo;
 */
extern("xr_conditions.check_npc_name", (actor: ClientObject, npc: ClientObject, params: LuaArray<string>): boolean => {
  const npcName: Optional<TName> = npc.name();

  if (npcName === null) {
    return false;
  }

  for (const [k, v] of params) {
    if (string.find(npcName, v)[0] !== null) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern(
  "xr_conditions.check_enemy_name",
  (actor: ClientObject, npc: ClientObject, params: LuaArray<string>): boolean => {
    const enemyId: TNumberId = registry.objects.get(npc.id()).enemy_id!;
    const enemy: Optional<ClientObject> = registry.objects.get(enemyId)?.object;

    if (enemy && enemy.alive()) {
      const name: string = enemy.name();

      for (const [i, v] of params) {
        if (string.find(name, v)[0] !== null) {
          return true;
        }
      }
    }

    return false;
  }
);

/**
 * todo;
 */
extern("xr_conditions.see_npc", (actor: ClientObject, npc: ClientObject, params: AnyArgs): boolean => {
  const targetNpc: Optional<ClientObject> = getObjectByStoryId(params[0]);

  if (npc && targetNpc) {
    return npc.see(targetNpc);
  } else {
    return false;
  }
});

/**
 * todo;
 */
extern("xr_conditions.is_wounded", (actor: ClientObject, npc: ClientObject): boolean => {
  return isObjectWounded(npc);
});

/**
 * todo;
 */
extern(
  "xr_conditions.distance_to_obj_on_job_le",
  (actor: ClientObject, npc: ClientObject, params: AnyArgs): boolean => {
    const smart: SmartTerrain = getObjectSmartTerrain(npc)!;

    for (const [k, descriptor] of smart.objectJobDescriptors) {
      const npcJob: ISmartTerrainJob = smart.jobsData.get(descriptor.job_id);

      if (npcJob.section === params[0]) {
        return npc.position().distance_to_sqr(descriptor.serverObject.position) <= params[1] * params[1];
      }
    }

    return false;
  }
);

/**
 * todo;
 */
extern("xr_conditions.is_obj_on_job", (actor: ClientObject, npc: ClientObject, params: AnyArgs): boolean => {
  const smartTerrain: Optional<SmartTerrain> =
    params && params[1]
      ? SimulationBoardManager.getInstance().getSmartTerrainByName(params[1])
      : getObjectSmartTerrain(npc);

  if (smartTerrain === null) {
    return false;
  }

  for (const [k, v] of smartTerrain.objectJobDescriptors) {
    const npcJob: ISmartTerrainJob = smartTerrain.jobsData.get(v.job_id);

    if (npcJob.section === params[0]) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.obj_in_zone", (actor: ClientObject, zone: ClientObject, params: LuaTable): boolean => {
  const simulator: AlifeSimulator = alife();

  for (const [i, v] of params) {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(v);

    if (objectId && zone.inside(simulator.object(objectId)!.position)) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern(
  "xr_conditions.one_obj_in_zone",
  (actor: ClientObject, zone: ClientObject, params: [string, string]): boolean => {
    const object: Optional<TNumberId> = getObjectIdByStoryId(params[0]);

    if (object) {
      return zone.inside(alife().object(object)!.position);
    } else {
      return params[1] !== FALSE;
    }
  }
);

/**
 * todo;
 */
extern("xr_conditions.health_le", (actor: ClientObject, npc: ClientObject, params: [number]): boolean => {
  return params[0] !== null && npc.health < params[0];
});

/**
 * todo;
 */
extern("xr_conditions.heli_health_le", (actor: ClientObject, object: ClientObject, params: [number]): boolean => {
  return params[0] !== null && object.get_helicopter().GetfHealth() < params[0];
});

/**
 * todo;
 */
extern(
  "xr_conditions.story_obj_in_zone_by_name",
  (actor: ClientObject, npc: ClientObject, params: [TStringId, string]): boolean => {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(params[0]);
    const zone: Optional<ClientObject> = registry.zones.get(params[1]);

    if (objectId && zone) {
      return zone.inside(alife().object(objectId)!.position);
    }

    return false;
  }
);

/**
 * todo;
 */
extern(
  "xr_conditions.npc_in_zone",
  (actor: ClientObject, npc: ClientObject | ServerObject, params: [string]): boolean => {
    const zone: Optional<ClientObject> = registry.zones.get(params[0]);
    let objectId: Optional<ClientObject> = null;

    if (type(npc.id) !== "function") {
      objectId = registry.objects.get((npc as ServerObject).id)?.object as Optional<ClientObject>;

      if (zone === null) {
        return true;
      } else if (objectId === null) {
        return zone.inside((npc as ServerObject).position);
      }
    } else {
      objectId = npc as ClientObject;
    }

    return isObjectInZone(objectId, zone);
  }
);

/**
 * todo;
 */
extern("xr_conditions.heli_see_npc", (actor: ClientObject, object: ClientObject, params: [string]) => {
  if (params[0]) {
    const storyObject: Optional<ClientObject> = getObjectByStoryId(params[0]);

    return storyObject !== null && object.get_helicopter().isVisible(storyObject);
  } else {
    return false;
  }
});

/**
 * todo;
 */
extern("xr_conditions.enemy_group", (actor: ClientObject, npc: ClientObject, params: LuaTable<number>): boolean => {
  const enemyId: TNumberId = registry.objects.get(npc.id()).enemy_id as number;
  const enemy: ClientObject = registry.objects.get(enemyId)?.object as ClientObject;
  const enemyGroup: TNumberId = enemy?.group();

  for (const [i, v] of params) {
    if (v === enemyGroup) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern(
  "xr_conditions.hitted_by",
  (actor: ClientObject, npc: ClientObject, parameters: LuaTable<TStringId>): boolean => {
    const state: Optional<ISchemeHitState> = registry.objects.get(npc.id())[EScheme.HIT] as ISchemeHitState;

    if (state !== null) {
      for (const [index, storyId] of parameters) {
        const listNpc: Optional<ClientObject> = getObjectByStoryId(storyId);

        if (listNpc !== null && state.who === listNpc.id()) {
          return true;
        }
      }
    }

    return false;
  }
);

/**
 * todo;
 */
extern(
  "xr_conditions.hitted_on_bone",
  (actor: ClientObject, npc: ClientObject, parameters: LuaArray<TStringId>): boolean => {
    const boneIndex: TIndex = (registry.objects.get(npc.id())[EScheme.HIT] as ISchemeHitState).bone_index;

    for (const [index, id] of parameters) {
      if (npc.get_bone_id(id) === boneIndex) {
        return true;
      }
    }

    return false;
  }
);

/**
 * todo;
 */
extern("xr_conditions.best_pistol", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.item_in_slot(1) !== null;
});

/**
 * todo;
 */
extern("xr_conditions.deadly_hit", (actor: ClientObject, npc: ClientObject): boolean => {
  return (registry.objects.get(npc.id())[EScheme.HIT] as ISchemeHitState)?.deadly_hit === true;
});

/**
 * todo;
 */
extern("xr_conditions.killed_by", (actor: ClientObject, npc: ClientObject, parameters: LuaArray<string>): boolean => {
  const schemeState: Optional<ISchemeDeathState> = registry.objects.get(npc.id())[EScheme.DEATH] as ISchemeDeathState;

  if (schemeState !== null) {
    for (const [i, v] of parameters) {
      const object: Optional<ClientObject> = getObjectByStoryId(v);

      if (object && schemeState.killer === object.id()) {
        return true;
      }
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.is_alive_all", (actor: ClientObject, npc: ClientObject, params: LuaArray<string>): boolean => {
  for (const [i, v] of params) {
    const npcId: Optional<TNumberId> = getObjectIdByStoryId(v);

    if (npcId === null) {
      return false;
    }

    const npcCseObject: Optional<ServerObject> = alife().object(npcId);

    if (npcCseObject && (!isStalker(npcCseObject) || !npcCseObject.alive())) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("xr_conditions.is_alive_one", (actor: ClientObject, npc: ClientObject, p: LuaArray<string>): boolean => {
  for (const [i, v] of p) {
    const npcId: Optional<TNumberId> = getObjectIdByStoryId(v);

    if (npcId === null) {
      return false;
    }

    const object: Optional<ServerObject> = alife().object(npcId);

    if (object && isStalker(object) && object.alive()) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.is_alive", (actor: ClientObject, npc: AnyGameObject, params: [string]): boolean => {
  let npc1: Optional<TNumberId> = null;

  if (npc === null || (params && params[0])) {
    npc1 = getObjectIdByStoryId(params[0]);
  } else if (type(npc.id) === "number") {
    npc1 = (npc as ServerObject).id;
  } else {
    npc1 = (npc as ClientObject).id();
  }

  if (npc1 === null) {
    return false;
  }

  const serverObject: Optional<ServerObject> = alife().object(npc1);

  return serverObject !== null && isStalker(serverObject) && serverObject.alive();
});

/**
 * todo;
 */
extern("xr_conditions.is_dead_all", (actor: ClientObject, npc: ClientObject, params: LuaArray<string>): boolean => {
  for (const [index, value] of params) {
    const npc1: Optional<ClientObject> = getObjectByStoryId(value);

    if (npc1) {
      return !npc1.alive();
    }

    return false;
  }

  return true;
});

/**
 * todo;
 */
extern("xr_conditions.is_dead_one", (actor: ClientObject, npc: ClientObject, p: LuaArray<string>): boolean => {
  for (const [index, value] of p) {
    const npc1: Optional<ClientObject> = getObjectByStoryId(value);

    if (!npc1 || !npc1.alive()) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.is_dead", (actor: ClientObject, npc: ClientObject, p: [string]): boolean => {
  const npc1: Optional<ClientObject> = getObjectByStoryId(p[0]);

  return !npc1 || !npc1.alive();
});

/**
 * todo;
 */
extern("xr_conditions.story_object_exist", (actor: ClientObject, npc: ClientObject, p: [string]): boolean => {
  return getObjectByStoryId(p[0]) !== null;
});

/**
 * todo;
 */
extern("xr_conditions.npc_has_item", (actor: ClientObject, npc: ClientObject, p: [string]): boolean => {
  return p[0] !== null && npc.object(p[0]) !== null;
});

/**
 * todo;
 */
extern("xr_conditions.has_enemy", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.best_enemy() !== null;
});

/**
 * todo;
 */
extern("xr_conditions.has_actor_enemy", (actor: ClientObject, npc: ClientObject): boolean => {
  const bestEnemy: Optional<ClientObject> = npc.best_enemy();

  return bestEnemy !== null && bestEnemy.id() === registry.actor.id();
});

/**
 * todo;
 */
extern("xr_conditions.see_enemy", (actor: ClientObject, npc: ClientObject): boolean => {
  const enemy: Optional<ClientObject> = npc.best_enemy();

  if (enemy !== null) {
    return npc.see(enemy);
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.heavy_wounded", (actor: ClientObject, npc: ClientObject): boolean => {
  return isHeavilyWounded(npc.id());
});

/**
 * todo;
 */
extern("xr_conditions.mob_has_enemy", (actor: ClientObject, npc: ClientObject): boolean => {
  if (npc === null) {
    return false;
  }

  return npc.get_enemy() !== null;
});

/**
 * todo;
 */
extern("xr_conditions.mob_was_hit", (actor: ClientObject, npc: ClientObject): boolean => {
  const h: MonsterHitInfo = npc.get_monster_hit_info();

  return h.who && h.time !== 0;
});

/**
 * todo;
 */
extern("xr_conditions.squad_in_zone", (actor: ClientObject, npc: ClientObject, p: [string, string]) => {
  const storyId: TStringId = p[0];
  let zoneName: TName = p[1];

  if (storyId === null) {
    abort(
      "Insufficient params in squad_in_zone function. story_id[%s], zone_name[%s]",
      tostring(storyId),
      tostring(zoneName)
    );
  }

  if (zoneName === null) {
    zoneName = npc.name();
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    return false;
  }

  const zone: ClientObject = registry.zones.get(zoneName);

  if (zone === null) {
    return false;
  }

  for (const squadMember of squad.squad_members()) {
    const position: Vector = registry.objects.get(squadMember.id)?.object?.position() || squadMember.object.position;

    if (zone.inside(position)) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.squad_has_enemy", (actor: ClientObject, npc: ClientObject, p: [Optional<TStringId>]): boolean => {
  const storyId: Optional<TStringId> = p[0];

  if (storyId === null) {
    abort("Insufficient params in squad_has_enemy function. story_id [%s]", tostring(storyId));
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    return false;
  }

  for (const squadMember of squad.squad_members()) {
    const npcObject: Optional<ClientObject> = level.object_by_id(squadMember.object.id);

    if (npcObject === null) {
      return false;
    }

    if (npcObject.best_enemy() !== null) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.squad_in_zone_all", (actor: ClientObject, npc: ClientObject, p: [TStringId, TName]): boolean => {
  const storyId: TStringId = p[0];
  const zoneName: TName = p[1];

  if (storyId === null || zoneName === null) {
    abort(
      "Insufficient params in squad_in_zone_all function. story_id[%s], zone_name[%s]",
      tostring(storyId),
      tostring(zoneName)
    );
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    return false;
  }

  const zone: Optional<ClientObject> = registry.zones.get(zoneName);

  if (zone === null) {
    return false;
  }

  for (const squadMember of squad.squad_members()) {
    const position: Vector = registry.objects.get(squadMember.id)?.object?.position() || squadMember.object.position;

    if (!zone.inside(position)) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("xr_conditions.squads_in_zone_b41", (actor: ClientObject, npc: ClientObject): boolean => {
  const smartTerrain: Optional<SmartTerrain> = SimulationBoardManager.getInstance().getSmartTerrainByName("jup_b41");
  const zone: Optional<ClientObject> = registry.zones.get("jup_b41_sr_light");

  if (zone === null) {
    return false;
  }

  if (smartTerrain === null) {
    return false;
  }

  for (const [k, v] of SimulationBoardManager.getInstance().getSmartTerrainDescriptorById(smartTerrain.id)!
    .assignedSquads) {
    if (v !== null) {
      for (const j of v.squad_members()) {
        if (!zone.inside(j.object.position)) {
          return false;
        }
      }
    }
  }

  return true;
});

/**
 * todo;
 */
extern("xr_conditions.target_squad_name", (actor: ClientObject, object: ServerCreatureObject, p: [string]): boolean => {
  if (p[0] === null) {
    abort("Wrong parameters for 'target_squad_name'.");
  }

  if (!object) {
    return false;
  }

  if (isStalker(object) || isMonster(object)) {
    if (alife().object(object.group_id) === null) {
      return false;
    }

    if (string.find(alife().object(object.group_id)!.section_name(), p[0])[0] !== null) {
      return true;
    }
  }

  return object.section_name() === p[0];
});

/**
 * todo;
 */
extern("xr_conditions.target_smart_name", (actor: ClientObject, smart: ClientObject, p: [string]): boolean => {
  if (p[0] === null) {
    abort("Wrong parameters");
  }

  return smart.name() === p[0];
});

/**
 * todo;
 */
extern("xr_conditions.squad_exist", (actor: ClientObject, npc: ClientObject, p: [Optional<string>]): boolean => {
  const storyId: Optional<string> = p[0];

  if (storyId === null) {
    abort("Wrong parameter story_id[%s] in squad_exist function", tostring(storyId));
  } else {
    return isSquadExisting(storyId);
  }
});

/**
 * todo;
 */
extern("xr_conditions.is_squad_commander", (actor: ClientObject, npc: ClientObject | ServerCreatureObject): boolean => {
  const npcId: TNumberId = type(npc.id) === "number" ? (npc as ServerObject).id : (npc as ClientObject).id();
  const squad: Optional<Squad> = getObjectSquad(npc);

  return squad !== null && squad.commander_id() === npcId;
});

/**
 * todo;
 */
extern("xr_conditions.squad_npc_count_ge", (actor: ClientObject, npc: ClientObject, p: [string, string]): boolean => {
  const storyId: Optional<TStringId> = p[0];

  if (storyId === null) {
    abort("Wrong parameter squad_id[%s] in 'squad_npc_count_ge' function", tostring(storyId));
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId) as Optional<Squad>;

  if (squad) {
    return squad.npc_count() > tonumber(p[1])!;
  } else {
    return false;
  }
});

/**
 * todo;
 */
extern("xr_conditions.quest_npc_enemy_actor", (actor: ClientObject, npc: ClientObject, p: [string]): boolean => {
  if (p[0] === null) {
    abort("wrong story id");
  } else {
    const object: Optional<ClientObject> = getObjectByStoryId(p[0]);

    if (object && isStalker(object)) {
      const actor: Optional<ClientObject> = registry.actor;

      if (actor && object.general_goodwill(actor) <= -1000) {
        return true;
      }
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.distance_to_obj_ge", (actor: ClientObject, npc: ClientObject, p: [string, number]): boolean => {
  const objectId: Optional<TNumberId> = getObjectIdByStoryId(p[0]);
  const object: Optional<ServerObject> = objectId ? alife().object(objectId) : null;

  if (object) {
    return registry.actor.position().distance_to_sqr(object.position) >= p[1] * p[1];
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.distance_to_obj_le", (actor: ClientObject, npc: ClientObject, p: [string, number]): boolean => {
  const objectId: Optional<TNumberId> = getObjectIdByStoryId(p[0]);
  const object: Optional<ServerObject> = objectId ? alife().object(objectId) : null;

  if (object) {
    return registry.actor.position().distance_to_sqr(object.position) < p[1] * p[1];
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.active_item", (actor: ClientObject, npc: ClientObject, params: LuaArray<TSection>): boolean => {
  if (params && params.has(1)) {
    for (const [, section] of params) {
      if (actor.item_in_slot(3) !== null && actor.item_in_slot(3)!.section() === section) {
        return true;
      }
    }
  }

  return false;
});

/**
 * todo;
 */
extern(
  "xr_conditions.check_bloodsucker_state",
  (actor: ClientObject, npc: Optional<ClientObject>, p: [string, string]): boolean => {
    if ((p && p[0]) === null) {
      abort("Wrong parameters in function 'check_bloodsucker_state'!!!");
    }

    let state: string = p[0];

    if (p[1] !== null) {
      state = p[1];
      npc = getObjectByStoryId(p[1]);
    }

    if (npc !== null) {
      return npc.get_visibility_state() === tonumber(state)!;
    }

    return false;
  }
);

/**
 * todo;
 */
extern("xr_conditions.in_dest_smart_cover", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.in_smart_cover();
});

/**
 * todo;
 */
extern("xr_conditions.dist_to_story_obj_ge", (actor: ClientObject, npc: ClientObject, p: [string, number]): boolean => {
  const storyId: TStringId = p && p[0];
  const storyObjectId: Optional<TNumberId> = getObjectIdByStoryId(storyId);

  if (storyObjectId === null) {
    return true;
  }

  return alife().object(storyObjectId)!.position.distance_to(registry.actor.position()) > p[1];
});

/**
 * todo;
 */
extern("xr_conditions.has_enemy_in_current_loopholes_fov", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.in_smart_cover() && npc.best_enemy() !== null && npc.in_current_loophole_fov(npc.best_enemy()!.position());
});

/**
 * todo;
 */
extern("xr_conditions.npc_talking", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.is_talking();
});

/**
 * todo;
 */
extern("xr_conditions.see_actor", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.alive() && npc.see(actor);
});

/**
 * todo;
 */
extern("xr_conditions.object_exist", (actor: ClientObject, npc: ClientObject, params: [string]): boolean => {
  return getObjectByStoryId(params[0]) !== null;
});

/**
 * todo;
 */
extern("xr_conditions.squad_curr_action", (actor: ClientObject, npc: ClientObject, p: [string]): boolean => {
  return getObjectSquad(npc)!.currentAction?.name === p[0];
});

/**
 * todo;
 */
extern("xr_conditions.dead_body_searching", (actor: ClientObject, npc: ClientObject): boolean => {
  return ActorInventoryMenuManager.getInstance().isActiveMode(EActorMenuMode.DEAD_BODY_SEARCH);
});

/**
 * todo;
 */
extern("xr_conditions.check_enemy_smart", (actor: ClientObject, npc: ClientObject, params: [string]): boolean => {
  const enemyId: Optional<TNumberId> = registry.objects.get(npc.id()).enemy_id;
  const enemy: Optional<ClientObject> = enemyId ? registry.objects.get(enemyId)?.object : null;

  if (enemy === null || enemyId === alife().actor().id) {
    return false;
  }

  const enemySmartTerrain: Optional<SmartTerrain> = getObjectSmartTerrain(enemy);

  return enemySmartTerrain !== null && enemySmartTerrain.name() === params[0];
});

/**
 * todo;
 */
extern("xr_conditions.polter_ignore_actor", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.poltergeist_get_actor_ignore();
});

/**
 * todo;
 */
extern("xr_conditions.burer_gravi_attack", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.burer_get_force_gravi_attack();
});

/**
 * todo;
 */
extern("xr_conditions.burer_anti_aim", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.burer_get_force_anti_aim();
});

/**
 * todo; probably remove.
 */
extern("xr_conditions._used", (actor: ClientObject, npc: ClientObject): boolean => {
  return npc.is_talking();
});

/**
 * todo;
 */
extern("xr_conditions.is_playing_sound", (actor: ClientObject, npc: ClientObject): boolean => {
  return isPlayingSound(npc);
});

/**
 * todo;
 */
extern("xr_conditions.is_door_blocked_by_npc", (actor: ClientObject, object: ClientObject): boolean => {
  return object.is_door_blocked_by_npc();
});

/**
 * todo;
 */
extern("xr_conditions.check_deimos_phase", (actor: ClientObject, npc: ClientObject, params: AnyArgs): boolean => {
  if (params[0] && params[1]) {
    const obj: IRegistryObjectState = registry.objects.get(npc.id());
    const delta: boolean = SchemeDeimos.checkIntensityDelta(obj);

    if (params[1] === "increasing" && delta) {
      return false;
    } else if (params[1] === "decreasing" && !delta) {
      return false;
    }

    if (params[0] === "disable_bound") {
      if (params[1] === "increasing") {
        if (!SchemeDeimos.checkDisableBound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return SchemeDeimos.checkDisableBound(obj);
      }
    } else if (params[0] === "lower_bound") {
      if (params[1] === "increasing") {
        if (!SchemeDeimos.checkLowerBound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return SchemeDeimos.checkLowerBound(obj);
      }
    } else if (params[0] === "upper_bound") {
      if (params[1] === "increasing") {
        if (!SchemeDeimos.checkUpperBound(obj)) {
          return true;
        }
      } else if (params[1] === "decreasing") {
        return SchemeDeimos.checkUpperBound(obj);
      }
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.animpoint_reached", (actor: ClientObject, npc: ClientObject): boolean => {
  const animpointState: Optional<ISchemeAnimpointState> = registry.objects.get(npc.id())[
    SchemeAnimpoint.SCHEME_SECTION
  ] as Optional<ISchemeAnimpointState>;

  if (animpointState === null) {
    return false;
  }

  return animpointState.animpoint.isPositionReached();
});

/**
 * todo;
 */
extern("xr_conditions.upgrade_hint_kardan", (actor: ClientObject, npc: ClientObject, params: AnyArgs): boolean => {
  const itemUpgradeHints: LuaArray<TCaption> = new LuaTable();
  const toolsCount: TCount = (params && tonumber(params[0])) || 0;
  let canUpgrade: number = 0;

  if (!hasAlifeInfo(infoPortions.zat_b3_all_instruments_brought)) {
    if (!hasAlifeInfo(infoPortions.zat_b3_tech_instrument_1_brought) && (toolsCount === 0 || toolsCount === 1)) {
      table.insert(itemUpgradeHints, captions.st_upgr_toolkit_1);
    } else if (toolsCount === 1) {
      canUpgrade = canUpgrade + 1;
    }

    if (!hasAlifeInfo(infoPortions.zat_b3_tech_instrument_2_brought) && (toolsCount === 0 || toolsCount === 2)) {
      table.insert(itemUpgradeHints, captions.st_upgr_toolkit_2);
    } else if (toolsCount === 2) {
      canUpgrade = canUpgrade + 1;
    }

    if (!hasAlifeInfo(infoPortions.zat_b3_tech_instrument_3_brought) && (toolsCount === 0 || toolsCount === 3)) {
      table.insert(itemUpgradeHints, captions.st_upgr_toolkit_3);
    } else if (toolsCount === 3) {
      canUpgrade = canUpgrade + 1;
    }
  } else {
    canUpgrade = canUpgrade + 1;
  }

  if (!hasAlifeInfo(infoPortions.zat_b3_tech_see_produce_62)) {
    if (toolsCount === 1 && !hasAlifeInfo(infoPortions.zat_b3_tech_have_one_dose)) {
      table.insert(itemUpgradeHints, captions.st_upgr_vodka);
    } else if (toolsCount !== 1 && !hasAlifeInfo(infoPortions.zat_b3_tech_have_couple_dose)) {
      table.insert(itemUpgradeHints, captions.st_upgr_vodka);
    } else {
      canUpgrade = canUpgrade + 1;
    }
  } else {
    canUpgrade = canUpgrade + 1;
  }

  ItemUpgradesManager.getInstance().setCurrentHints(itemUpgradeHints);

  return canUpgrade >= 2;
});
