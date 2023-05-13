import {
  alife,
  clsid,
  level,
  XR_alife_simulator,
  XR_cse_abstract,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_object,
  XR_game_object,
  XR_MonsterHitInfo,
  XR_vector,
} from "xray16";

import { getObjectByStoryId, getObjectIdByStoryId, getServerObjectByStoryId, registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { ActorInventoryMenuManager, EActorMenuMode } from "@/engine/core/managers/interface/ActorInventoryMenuManager";
import { SmartTerrain, Squad } from "@/engine/core/objects";
import { ISchemeDeathState } from "@/engine/core/schemes/death";
import { ISchemeHitState } from "@/engine/core/schemes/hit";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import {
  isDistanceBetweenObjectsGreaterOrEqual,
  isDistanceBetweenObjectsLessOrEqual,
  isHeavilyWounded,
  isObjectInZone,
  isObjectWounded,
  isSquadExisting,
} from "@/engine/core/utils/check/check";
import { isMonster, isStalker } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain, getObjectSquad } from "@/engine/core/utils/object";
import { FALSE } from "@/engine/lib/constants/words";
import {
  AnyArgs,
  EScheme,
  LuaArray,
  Optional,
  TIndex,
  TName,
  TNumberId,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern("xr_conditions.is_monster_snork", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.clsid() === clsid.snork_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_dog", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.clsid() === clsid.dog_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_psy_dog", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.clsid() === clsid.psy_dog_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_polter", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.clsid() === clsid.poltergeist_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_tushkano", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.clsid() === clsid.tushkano_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_burer", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.clsid() === clsid.burer_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_controller", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.clsid() === clsid.controller_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_flesh", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.clsid() === clsid.flesh_s;
});

/**
 * todo;
 */
extern("xr_conditions.is_monster_boar", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.clsid() === clsid.boar_s;
});

/**
 * todo;
 */
extern("xr_conditions.fighting_dist_ge", (first: XR_game_object, second: XR_game_object, params: AnyArgs): boolean => {
  return isDistanceBetweenObjectsGreaterOrEqual(first, second, params[0]);
});

/**
 * todo;
 */
extern("xr_conditions.fighting_dist_le", (first: XR_game_object, second: XR_game_object, params: AnyArgs): boolean => {
  return isDistanceBetweenObjectsLessOrEqual(first, second, params[0]);
});

/**
 * todo;
 */
extern("xr_conditions.enemy_in_zone", (enemy: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean => {
  const zone: Optional<XR_game_object> = registry.zones.get(params[0]);

  if (zone === null) {
    abort("Wrong zone name '%s' in enemy_in_zone function.", tostring(params[0]));
  }

  return isObjectInZone(enemy, zone);
});

/**
 * todo;
 */
extern(
  "xr_conditions.check_npc_name",
  (actor: XR_game_object, npc: XR_game_object, params: LuaArray<string>): boolean => {
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
  }
);

/**
 * todo;
 */
extern(
  "xr_conditions.check_enemy_name",
  (actor: XR_game_object, npc: XR_game_object, params: LuaArray<string>): boolean => {
    const enemyId: TNumberId = registry.objects.get(npc.id()).enemy_id!;
    const enemy: Optional<XR_game_object> = registry.objects.get(enemyId)?.object;

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
extern("xr_conditions.see_npc", (actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean => {
  const targetNpc: Optional<XR_game_object> = getObjectByStoryId(params[0]);

  if (npc && targetNpc) {
    return npc.see(targetNpc);
  } else {
    return false;
  }
});

/**
 * todo;
 */
extern("xr_conditions.is_wounded", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return isObjectWounded(npc);
});

/**
 * todo;
 */
extern(
  "xr_conditions.distance_to_obj_on_job_le",
  (actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean => {
    const smart: SmartTerrain = getObjectSmartTerrain(npc)!;

    for (const [k, descriptor] of smart.objectJobDescriptors) {
      const npc_job = smart.jobsData.get(descriptor.job_id);

      if (npc_job.section === params[0]) {
        return npc.position().distance_to_sqr(descriptor.serverObject.position) <= params[1] * params[1];
      }
    }

    return false;
  }
);

/**
 * todo;
 */
extern("xr_conditions.is_obj_on_job", (actor: XR_game_object, npc: XR_game_object, params: AnyArgs): boolean => {
  const smart =
    params && params[1]
      ? SimulationBoardManager.getInstance().getSmartTerrainByName(params[1])
      : getObjectSmartTerrain(npc);

  if (smart === null) {
    return false;
  }

  for (const [k, v] of smart.objectJobDescriptors) {
    const npc_job = smart.jobsData.get(v.job_id);

    if (npc_job.section === params[0]) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.obj_in_zone", (actor: XR_game_object, zone: XR_game_object, params: LuaTable): boolean => {
  const sim: XR_alife_simulator = alife();

  for (const [i, v] of params) {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(v);

    if (objectId && zone.inside(sim.object(objectId)!.position)) {
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
  (actor: XR_game_object, zone: XR_game_object, params: [string, string]): boolean => {
    const obj1: Optional<number> = getObjectIdByStoryId(params[0]);

    if (obj1) {
      return zone.inside(alife().object(obj1)!.position);
    } else {
      return params[1] !== FALSE;
    }
  }
);

/**
 * todo;
 */
extern("xr_conditions.health_le", (actor: XR_game_object, npc: XR_game_object, params: [number]): boolean => {
  return params[0] !== null && npc.health < params[0];
});

/**
 * todo;
 */
extern("xr_conditions.heli_health_le", (actor: XR_game_object, object: XR_game_object, params: [number]): boolean => {
  return params[0] !== null && object.get_helicopter().GetfHealth() < params[0];
});

/**
 * todo;
 */
extern(
  "xr_conditions.story_obj_in_zone_by_name",
  (actor: XR_game_object, npc: XR_game_object, params: [TStringId, string]): boolean => {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(params[0]);
    const zone: Optional<XR_game_object> = registry.zones.get(params[1]);

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
  (actor: XR_game_object, npc: XR_game_object | XR_cse_abstract, params: [string]): boolean => {
    const zone: Optional<XR_game_object> = registry.zones.get(params[0]);
    let objectId: Optional<XR_game_object> = null;

    if (type(npc.id) !== "function") {
      objectId = registry.objects.get((npc as XR_cse_abstract).id)?.object as Optional<XR_game_object>;

      if (zone === null) {
        return true;
      } else if (objectId === null) {
        return zone.inside((npc as XR_cse_abstract).position);
      }
    } else {
      objectId = npc as XR_game_object;
    }

    return isObjectInZone(objectId, zone);
  }
);

/**
 * todo;
 */
extern("xr_conditions.heli_see_npc", (actor: XR_game_object, object: XR_game_object, params: [string]) => {
  if (params[0]) {
    const storyObject: Optional<XR_game_object> = getObjectByStoryId(params[0]);

    return storyObject !== null && object.get_helicopter().isVisible(storyObject);
  } else {
    return false;
  }
});

/**
 * todo;
 */
extern("xr_conditions.enemy_group", (actor: XR_game_object, npc: XR_game_object, params: LuaTable<number>): boolean => {
  const enemyId: number = registry.objects.get(npc.id()).enemy_id as number;
  const enemy: XR_game_object = registry.objects.get(enemyId)?.object as XR_game_object;
  const enemyGroup = enemy?.group();

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
  (actor: XR_game_object, npc: XR_game_object, parameters: LuaTable<TStringId>): boolean => {
    const state: Optional<ISchemeHitState> = registry.objects.get(npc.id())[EScheme.HIT] as ISchemeHitState;

    if (state !== null) {
      for (const [index, storyId] of parameters) {
        const listNpc: Optional<XR_game_object> = getObjectByStoryId(storyId);

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
  (actor: XR_game_object, npc: XR_game_object, parameters: LuaArray<TStringId>): boolean => {
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
extern("xr_conditions.best_pistol", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.item_in_slot(1) !== null;
});

/**
 * todo;
 */
extern("xr_conditions.deadly_hit", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return (registry.objects.get(npc.id())[EScheme.HIT] as ISchemeHitState)?.deadly_hit === true;
});

/**
 * todo;
 */
extern(
  "xr_conditions.killed_by",
  (actor: XR_game_object, npc: XR_game_object, parameters: LuaArray<string>): boolean => {
    const schemeState: Optional<ISchemeDeathState> = registry.objects.get(npc.id())[EScheme.DEATH] as ISchemeDeathState;

    if (schemeState !== null) {
      for (const [i, v] of parameters) {
        const object = getObjectByStoryId(v);

        if (object && schemeState.killer === object.id()) {
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
  "xr_conditions.is_alive_all",
  (actor: XR_game_object, npc: XR_game_object, params: LuaArray<string>): boolean => {
    for (const [i, v] of params) {
      const npcId = getObjectIdByStoryId(v);

      if (npcId === null) {
        return false;
      }

      const npcCseObject: Optional<XR_cse_alife_creature_abstract> = alife().object(npcId);

      if (npcCseObject && (!isStalker(npcCseObject) || !npcCseObject.alive())) {
        return false;
      }
    }

    return true;
  }
);

/**
 * todo;
 */
extern("xr_conditions.is_alive_one", (actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>): boolean => {
  for (const [i, v] of p) {
    const npcId = getObjectIdByStoryId(v);

    if (npcId === null) {
      return false;
    }

    const npc1 = alife().object(npcId);

    if (npc1 && isStalker(npc1) && npc1.alive()) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern(
  "xr_conditions.is_alive",
  (actor: XR_game_object, npc: XR_game_object | XR_cse_abstract, params: [string]): boolean => {
    let npc1: Optional<TNumberId> = null;

    if (npc === null || (params && params[0])) {
      npc1 = getObjectIdByStoryId(params[0]);
    } else if (type(npc.id) === "number") {
      npc1 = (npc as XR_cse_abstract).id;
    } else {
      npc1 = (npc as XR_game_object).id();
    }

    if (npc1 === null) {
      return false;
    }

    const serverObject: Optional<XR_cse_alife_object> = alife().object(npc1);

    return serverObject !== null && isStalker(serverObject) && serverObject.alive();
  }
);

/**
 * todo;
 */
extern("xr_conditions.is_dead_all", (actor: XR_game_object, npc: XR_game_object, params: LuaArray<string>): boolean => {
  for (const [index, value] of params) {
    const npc1: Optional<XR_game_object> = getObjectByStoryId(value);

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
extern("xr_conditions.is_dead_one", (actor: XR_game_object, npc: XR_game_object, p: LuaArray<string>): boolean => {
  for (const [index, value] of p) {
    const npc1: Optional<XR_game_object> = getObjectByStoryId(value);

    if (!npc1 || !npc1.alive()) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.is_dead", (actor: XR_game_object, npc: XR_game_object, p: [string]): boolean => {
  const npc1: Optional<XR_game_object> = getObjectByStoryId(p[0]);

  return !npc1 || !npc1.alive();
});

/**
 * todo;
 */
extern("xr_conditions.story_object_exist", (actor: XR_game_object, npc: XR_game_object, p: [string]): boolean => {
  return getObjectByStoryId(p[0]) !== null;
});

/**
 * todo;
 */
extern("xr_conditions.npc_has_item", (actor: XR_game_object, npc: XR_game_object, p: [string]): boolean => {
  return p[0] !== null && npc.object(p[0]) !== null;
});

/**
 * todo;
 */
extern("xr_conditions.has_enemy", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.best_enemy() !== null;
});

/**
 * todo;
 */
extern("xr_conditions.has_actor_enemy", (actor: XR_game_object, npc: XR_game_object): boolean => {
  const best_enemy: Optional<XR_game_object> = npc.best_enemy();

  return best_enemy !== null && best_enemy.id() === registry.actor.id();
});

/**
 * todo;
 */
extern("xr_conditions.see_enemy", (actor: XR_game_object, npc: XR_game_object): boolean => {
  const enemy = npc.best_enemy();

  if (enemy !== null) {
    return npc.see(enemy);
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.heavy_wounded", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return isHeavilyWounded(npc.id());
});

/**
 * todo;
 */
extern("xr_conditions.mob_has_enemy", (actor: XR_game_object, npc: XR_game_object): boolean => {
  if (npc === null) {
    return false;
  }

  return npc.get_enemy() !== null;
});

/**
 * todo;
 */
extern("xr_conditions.mob_was_hit", (actor: XR_game_object, npc: XR_game_object): boolean => {
  const h: XR_MonsterHitInfo = npc.get_monster_hit_info();

  return h.who && h.time !== 0;
});

/**
 * todo;
 */
extern("xr_conditions.squad_in_zone", (actor: XR_game_object, npc: XR_game_object, p: [string, string]) => {
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

  const zone = registry.zones.get(zoneName);

  if (zone === null) {
    return false;
  }

  for (const squadMember of squad.squad_members()) {
    const position: XR_vector = registry.objects.get(squadMember.id)?.object?.position() || squadMember.object.position;

    if (zone.inside(position)) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern(
  "xr_conditions.squad_has_enemy",
  (actor: XR_game_object, npc: XR_game_object, p: [Optional<TStringId>]): boolean => {
    const storyId: Optional<TStringId> = p[0];

    if (storyId === null) {
      abort("Insufficient params in squad_has_enemy function. story_id [%s]", tostring(storyId));
    }

    const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

    if (squad === null) {
      return false;
    }

    for (const squadMember of squad.squad_members()) {
      const npc_obj = level.object_by_id(squadMember.object.id);

      if (npc_obj === null) {
        return false;
      }

      if (npc_obj.best_enemy() !== null) {
        return true;
      }
    }

    return false;
  }
);

/**
 * todo;
 */
extern(
  "xr_conditions.squad_in_zone_all",
  (actor: XR_game_object, npc: XR_game_object, p: [TStringId, TName]): boolean => {
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

    const zone: Optional<XR_game_object> = registry.zones.get(zoneName);

    if (zone === null) {
      return false;
    }

    for (const squadMember of squad.squad_members()) {
      const position: XR_vector =
        registry.objects.get(squadMember.id)?.object?.position() || squadMember.object.position;

      if (!zone.inside(position)) {
        return false;
      }
    }

    return true;
  }
);

/**
 * todo;
 */
extern("xr_conditions.squads_in_zone_b41", (actor: XR_game_object, npc: XR_game_object): boolean => {
  const smartTerrain: Optional<SmartTerrain> = SimulationBoardManager.getInstance().getSmartTerrainByName("jup_b41");
  const zone: Optional<XR_game_object> = registry.zones.get("jup_b41_sr_light");

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
extern(
  "xr_conditions.target_squad_name",
  (actor: XR_game_object, object: XR_cse_alife_creature_abstract, p: [string]): boolean => {
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
  }
);

/**
 * todo;
 */
extern("xr_conditions.target_smart_name", (actor: XR_game_object, smart: XR_game_object, p: [string]): boolean => {
  if (p[0] === null) {
    abort("Wrong parameters");
  }

  return smart.name() === p[0];
});

/**
 * todo;
 */
extern("xr_conditions.squad_exist", (actor: XR_game_object, npc: XR_game_object, p: [Optional<string>]): boolean => {
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
extern(
  "xr_conditions.is_squad_commander",
  (actor: XR_game_object, npc: XR_game_object | XR_cse_alife_creature_abstract): boolean => {
    const npc_id: number = type(npc.id) === "number" ? (npc as XR_cse_alife_object).id : (npc as XR_game_object).id();
    const squad: Optional<Squad> = getObjectSquad(npc);

    return squad !== null && squad.commander_id() === npc_id;
  }
);

/**
 * todo;
 */
extern(
  "xr_conditions.squad_npc_count_ge",
  (actor: XR_game_object, npc: XR_game_object, p: [string, string]): boolean => {
    const story_id: Optional<string> = p[0];

    if (story_id === null) {
      abort("Wrong parameter squad_id[%s] in 'squad_npc_count_ge' function", tostring(story_id));
    }

    const squad: Optional<Squad> = getServerObjectByStoryId(story_id) as Optional<Squad>;

    if (squad) {
      return squad.npc_count() > tonumber(p[1])!;
    } else {
      return false;
    }
  }
);

/**
 * todo;
 */
extern("xr_conditions.quest_npc_enemy_actor", (actor: XR_game_object, npc: XR_game_object, p: [string]): boolean => {
  if (p[0] === null) {
    abort("wrong story id");
  } else {
    const object: Optional<XR_game_object> = getObjectByStoryId(p[0]);

    if (object && isStalker(object)) {
      const actor: Optional<XR_game_object> = registry.actor;

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
extern(
  "xr_conditions.distance_to_obj_ge",
  (actor: XR_game_object, npc: XR_game_object, p: [string, number]): boolean => {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(p[0]);
    const object: Optional<XR_cse_alife_object> = objectId ? alife().object(objectId) : null;

    if (object) {
      return registry.actor.position().distance_to_sqr(object.position) >= p[1] * p[1];
    }

    return false;
  }
);

/**
 * todo;
 */
extern(
  "xr_conditions.distance_to_obj_le",
  (actor: XR_game_object, npc: XR_game_object, p: [string, number]): boolean => {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(p[0]);
    const object: Optional<XR_cse_alife_object> = objectId ? alife().object(objectId) : null;

    if (object) {
      return registry.actor.position().distance_to_sqr(object.position) < p[1] * p[1];
    }

    return false;
  }
);

/**
 * todo;
 */
extern(
  "xr_conditions.active_item",
  (actor: XR_game_object, npc: XR_game_object, params: LuaArray<TSection>): boolean => {
    if (params && params.has(1)) {
      for (const [k, section] of params) {
        if (actor.item_in_slot(3) !== null && actor.item_in_slot(3)!.section() === section) {
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
  "xr_conditions.check_bloodsucker_state",
  (actor: XR_game_object, npc: Optional<XR_game_object>, p: [string, string]): boolean => {
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
extern("xr_conditions.in_dest_smart_cover", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.in_smart_cover();
});

/**
 * todo;
 */
extern(
  "xr_conditions.dist_to_story_obj_ge",
  (actor: XR_game_object, npc: XR_game_object, p: [string, number]): boolean => {
    const storyId: TStringId = p && p[0];
    const storyObjectId: Optional<TNumberId> = getObjectIdByStoryId(storyId);

    if (storyObjectId === null) {
      return true;
    }

    return alife().object(storyObjectId)!.position.distance_to(registry.actor.position()) > p[1];
  }
);

/**
 * todo;
 */
extern("xr_conditions.has_enemy_in_current_loopholes_fov", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.in_smart_cover() && npc.best_enemy() !== null && npc.in_current_loophole_fov(npc.best_enemy()!.position());
});

/**
 * todo;
 */
extern("xr_conditions.npc_talking", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.is_talking();
});

/**
 * todo;
 */
extern("xr_conditions.see_actor", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.alive() && npc.see(actor);
});

/**
 * todo;
 */
extern("xr_conditions.object_exist", (actor: XR_game_object, npc: XR_game_object, params: [string]): boolean => {
  return getObjectByStoryId(params[0]) !== null;
});

/**
 * todo;
 */
extern("xr_conditions.squad_curr_action", (actor: XR_game_object, npc: XR_game_object, p: [string]): boolean => {
  return getObjectSquad(npc)!.currentAction?.name === p[0];
});

/**
 * todo;
 */
extern("xr_conditions.dead_body_searching", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return ActorInventoryMenuManager.getInstance().isActiveMode(EActorMenuMode.DEAD_BODY_SEARCH);
});

/**
 * todo;
 */
extern("xr_conditions.check_enemy_smart", (actor: XR_game_object, npc: XR_game_object, params: [string]): boolean => {
  const enemyId: Optional<TNumberId> = registry.objects.get(npc.id()).enemy_id;
  const enemy: Optional<XR_game_object> = enemyId ? registry.objects.get(enemyId)?.object : null;

  if (enemy === null || enemyId === alife().actor().id) {
    return false;
  }

  const enemy_smart: Optional<SmartTerrain> = getObjectSmartTerrain(enemy);

  return enemy_smart !== null && enemy_smart.name() === params[0];
});

/**
 * todo;
 */
extern("xr_conditions.polter_ignore_actor", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.poltergeist_get_actor_ignore();
});

/**
 * todo;
 */
extern("xr_conditions.burer_gravi_attack", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.burer_get_force_gravi_attack();
});

/**
 * todo;
 */
extern("xr_conditions.burer_anti_aim", (actor: XR_game_object, npc: XR_game_object): boolean => {
  return npc.burer_get_force_anti_aim();
});
