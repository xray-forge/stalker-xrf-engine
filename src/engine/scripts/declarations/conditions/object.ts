import { level, MonsterHitInfo } from "xray16";

import {
  getManager,
  getObjectByStoryId,
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  isStoryObjectExisting,
  registry,
} from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { UpgradesManager } from "@/engine/core/managers/upgrades/UpgradesManager";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import { ESquadActionType } from "@/engine/core/objects/squad/squad_types";
import { isDeimosPhaseActive } from "@/engine/core/schemes/restrictor/sr_deimos";
import { ISchemeAnimpointState, SchemeAnimpoint } from "@/engine/core/schemes/stalker/animpoint";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit";
import { abort, assert } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import {
  isBoar,
  isBurer,
  isController,
  isDog,
  isFlesh,
  isMonster,
  isPoltergeist,
  isPsyDog,
  isSnork,
  isStalker,
  isTushkano,
} from "@/engine/core/utils/class_ids";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { isObjectWounded } from "@/engine/core/utils/planner";
import {
  getObjectSmartTerrain,
  isDistanceBetweenObjectsGreaterOrEqual,
  isDistanceBetweenObjectsLessOrEqual,
  isObjectInZone,
} from "@/engine/core/utils/position";
import { isPlayingSound } from "@/engine/core/utils/sound";
import { getObjectSquad, isObjectSquadCommander } from "@/engine/core/utils/squad";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { FALSE } from "@/engine/lib/constants/words";
import {
  AlifeSimulator,
  AnyArgs,
  AnyGameObject,
  EScheme,
  GameObject,
  LuaArray,
  Optional,
  ServerCreatureObject,
  ServerObject,
  TCount,
  TDistance,
  TIndex,
  TLabel,
  TName,
  TNumberId,
  TSection,
  TStringId,
  Vector,
} from "@/engine/lib/types";

/**
 * Whether object is snork
 */
extern("xr_conditions.is_monster_snork", (actor: GameObject, object: GameObject): boolean => {
  return isSnork(object);
});

/**
 * Whether object is dog
 */
extern("xr_conditions.is_monster_dog", (actor: GameObject, object: GameObject): boolean => {
  return isDog(object);
});

/**
 * Whether object is psy dog
 */
extern("xr_conditions.is_monster_psy_dog", (actor: GameObject, object: GameObject): boolean => {
  return isPsyDog(object);
});

/**
 * Whether object is poltergeist
 */
extern("xr_conditions.is_monster_polter", (actor: GameObject, object: GameObject): boolean => {
  return isPoltergeist(object);
});

/**
 * Whether object is tushkano
 */
extern("xr_conditions.is_monster_tushkano", (actor: GameObject, object: GameObject): boolean => {
  return isTushkano(object);
});

/**
 * Whether object is burer
 */
extern("xr_conditions.is_monster_burer", (actor: GameObject, object: GameObject): boolean => {
  return isBurer(object);
});

/**
 * Whether object is controller
 */
extern("xr_conditions.is_monster_controller", (actor: GameObject, object: GameObject): boolean => {
  return isController(object);
});

/**
 * Whether object is flesh
 */
extern("xr_conditions.is_monster_flesh", (actor: GameObject, object: GameObject): boolean => {
  return isFlesh(object);
});

/**
 * Whether object is boar
 */
extern("xr_conditions.is_monster_boar", (actor: GameObject, object: GameObject): boolean => {
  return isBoar(object);
});

/**
 * Whether distance between actor and object greater or equal
 */
extern("xr_conditions.fighting_dist_ge", (actor: GameObject, object: GameObject, [distance]: [TDistance]): boolean => {
  return isDistanceBetweenObjectsGreaterOrEqual(actor, object, distance);
});

/**
 * Whether distance between actor and object less or equal
 */
extern("xr_conditions.fighting_dist_le", (actor: GameObject, object: GameObject, [distance]: [TDistance]): boolean => {
  return isDistanceBetweenObjectsLessOrEqual(actor, object, distance);
});

/**
 * Whether actor is in zone.
 *
 * todo: rename
 * todo: rename
 */
extern("xr_conditions.enemy_in_zone", (actor: GameObject, object: GameObject, [name]: [TName]): boolean => {
  const zone: Optional<GameObject> = registry.zones.get(name) as Optional<GameObject>;

  return zone
    ? isObjectInZone(registry.actor, zone)
    : abort("Unexpected zone name '%s' in enemy_in_zone xr condition.", name);
});

/**
 * Whether object name matches one of provided parameters.
 */
extern("xr_conditions.check_npc_name", (actor: GameObject, object: GameObject, params: LuaArray<TName>): boolean => {
  const objectName: Optional<TName> = object.name();

  if (objectName === null) {
    return false;
  }

  for (const [, name] of ipairs(params)) {
    if (string.find(objectName, name)[0]) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.check_enemy_name", (actor: GameObject, object: GameObject, params: LuaArray<TName>): boolean => {
  const enemyId: TNumberId = registry.objects.get(object.id()).enemyId!;
  const enemy: Optional<GameObject> = registry.objects.get(enemyId)?.object;

  if (enemy && enemy.alive()) {
    const enemyName: TName = enemy.name();

    for (const [, name] of params) {
      if (string.find(enemyName, name)[0] !== null) {
        return true;
      }
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.see_npc", (actor: GameObject, object: GameObject, [storyId]: [TStringId]): boolean => {
  const targetObject: Optional<GameObject> = getObjectByStoryId(storyId);

  return object && targetObject ? object.see(targetObject) : false;
});

/**
 * Whether object is currently wounded and using wounded scheme
 */
extern("xr_conditions.is_wounded", (actor: GameObject, object: GameObject): boolean => {
  return isObjectWounded(object.id());
});

/**
 * todo;
 */
extern("xr_conditions.distance_to_obj_on_job_le", (actor: GameObject, object: GameObject, params: AnyArgs): boolean => {
  const smart: SmartTerrain = getObjectSmartTerrain(object)!;

  for (const [, descriptor] of smart.objectJobDescriptors) {
    if (descriptor.job && descriptor.job.section === params[0]) {
      return object.position().distance_to_sqr(descriptor.object.position) <= params[1] * params[1];
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.is_obj_on_job", (actor: GameObject, object: GameObject, params: AnyArgs): boolean => {
  const smartTerrain: Optional<SmartTerrain> =
    params && params[1]
      ? getManager(SimulationManager).getSmartTerrainByName(params[1])
      : getObjectSmartTerrain(object);

  if (smartTerrain === null) {
    return false;
  }

  for (const [, descriptor] of smartTerrain.objectJobDescriptors) {
    if (descriptor.job && descriptor.job.section === params[0]) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.obj_in_zone", (actor: GameObject, zone: GameObject, params: LuaTable): boolean => {
  const simulator: AlifeSimulator = registry.simulator;

  for (const [, v] of params) {
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
extern("xr_conditions.one_obj_in_zone", (actor: GameObject, zone: GameObject, params: [string, string]): boolean => {
  const object: Optional<TNumberId> = getObjectIdByStoryId(params[0]);

  if (object) {
    return zone.inside(registry.simulator.object(object)!.position);
  } else {
    return params[1] !== FALSE;
  }
});

/**
 * todo;
 */
extern("xr_conditions.health_le", (actor: GameObject, object: GameObject, params: [number]): boolean => {
  return params[0] !== null && object.health < params[0];
});

/**
 * todo;
 */
extern("xr_conditions.heli_health_le", (actor: GameObject, object: GameObject, params: [number]): boolean => {
  return params[0] !== null && object.get_helicopter().GetfHealth() < params[0];
});

/**
 * todo;
 */
extern(
  "xr_conditions.story_obj_in_zone_by_name",
  (actor: GameObject, object: GameObject, params: [TStringId, string]): boolean => {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(params[0]);
    const zone: Optional<GameObject> = registry.zones.get(params[1]);

    if (objectId && zone) {
      return zone.inside(registry.simulator.object(objectId)!.position);
    }

    return false;
  }
);

/**
 * todo;
 */
extern(
  "xr_conditions.npc_in_zone",
  (actor: GameObject, object: GameObject | ServerObject, params: [string]): boolean => {
    const zone: Optional<GameObject> = registry.zones.get(params[0]);
    let objectId: Optional<GameObject> = null;

    if (type(object.id) !== "function") {
      objectId = registry.objects.get((object as ServerObject).id)?.object as Optional<GameObject>;

      if (zone === null) {
        return true;
      } else if (objectId === null) {
        return zone.inside((object as ServerObject).position);
      }
    } else {
      objectId = object as GameObject;
    }

    return isObjectInZone(objectId, zone);
  }
);

/**
 * todo;
 */
extern("xr_conditions.heli_see_npc", (actor: GameObject, object: GameObject, params: [string]) => {
  if (params[0]) {
    const storyObject: Optional<GameObject> = getObjectByStoryId(params[0]);

    return storyObject !== null && object.get_helicopter().isVisible(storyObject);
  } else {
    return false;
  }
});

/**
 * todo;
 */
extern("xr_conditions.enemy_group", (actor: GameObject, object: GameObject, params: LuaTable<number>): boolean => {
  const enemyId: TNumberId = registry.objects.get(object.id()).enemyId as number;
  const enemy: GameObject = registry.objects.get(enemyId)?.object as GameObject;
  const enemyGroup: TNumberId = enemy?.group();

  for (const [, v] of params) {
    if (v === enemyGroup) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.hitted_by", (actor: GameObject, object: GameObject, parameters: LuaTable<TStringId>): boolean => {
  const state: Optional<ISchemeHitState> = registry.objects.get(object.id())[EScheme.HIT] as ISchemeHitState;

  if (state !== null) {
    for (const [index, storyId] of parameters) {
      const listNpc: Optional<GameObject> = getObjectByStoryId(storyId);

      if (listNpc !== null && state.who === listNpc.id()) {
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
  "xr_conditions.hitted_on_bone",
  (actor: GameObject, object: GameObject, parameters: LuaArray<TStringId>): boolean => {
    const boneIndex: TIndex = (registry.objects.get(object.id())[EScheme.HIT] as ISchemeHitState).boneIndex;

    for (const [index, id] of parameters) {
      if (object.get_bone_id(id) === boneIndex) {
        return true;
      }
    }

    return false;
  }
);

/**
 * Whether object has any pistol in slot `1`
 */
extern("xr_conditions.best_pistol", (actor: GameObject, object: GameObject): boolean => {
  return object.item_in_slot(1) !== null;
});

/**
 * todo;
 */
extern("xr_conditions.deadly_hit", (actor: GameObject, object: GameObject): boolean => {
  return (registry.objects.get(object.id())[EScheme.HIT] as ISchemeHitState)?.isDeadlyHit === true;
});

/**
 * todo;
 */
extern("xr_conditions.killed_by", (actor: GameObject, object: GameObject, parameters: LuaArray<string>): boolean => {
  const schemeState: Optional<ISchemeDeathState> = registry.objects.get(object.id())[
    EScheme.DEATH
  ] as ISchemeDeathState;

  if (schemeState !== null) {
    for (const [, v] of parameters) {
      const object: Optional<GameObject> = getObjectByStoryId(v);

      if (object && schemeState.killerId === object.id()) {
        return true;
      }
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.is_alive_all", (actor: GameObject, object: GameObject, params: LuaArray<string>): boolean => {
  for (const [, v] of params) {
    const npcId: Optional<TNumberId> = getObjectIdByStoryId(v);

    if (npcId === null) {
      return false;
    }

    const npcCseObject: Optional<ServerObject> = registry.simulator.object(npcId);

    if (npcCseObject && (!isStalker(npcCseObject) || !npcCseObject.alive())) {
      return false;
    }
  }

  return true;
});

/**
 * todo;
 */
extern("xr_conditions.is_alive_one", (actor: GameObject, object: GameObject, p: LuaArray<string>): boolean => {
  for (const [i, v] of p) {
    const npcId: Optional<TNumberId> = getObjectIdByStoryId(v);

    if (npcId === null) {
      return false;
    }

    const object: Optional<ServerObject> = registry.simulator.object(npcId);

    if (object && isStalker(object) && object.alive()) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.is_alive", (actor: GameObject, object: AnyGameObject, params: [string]): boolean => {
  let npc1: Optional<TNumberId> = null;

  if (object === null || (params && params[0])) {
    npc1 = getObjectIdByStoryId(params[0]);
  } else if (type(object.id) === "number") {
    npc1 = (object as ServerObject).id;
  } else {
    npc1 = (object as GameObject).id();
  }

  if (npc1 === null) {
    return false;
  }

  const serverObject: Optional<ServerObject> = registry.simulator.object(npc1);

  return serverObject !== null && isStalker(serverObject) && serverObject.alive();
});

/**
 * todo;
 */
extern("xr_conditions.is_dead", (actor: GameObject, object: GameObject, p: [string]): boolean => {
  const npc1: Optional<GameObject> = getObjectByStoryId(p[0]);

  return !npc1 || !npc1.alive();
});

/**
 * todo;
 */
extern("xr_conditions.story_object_exist", (actor: GameObject, object: GameObject, p: [string]): boolean => {
  return getObjectByStoryId(p[0]) !== null;
});

/**
 * todo;
 */
extern("xr_conditions.npc_has_item", (actor: GameObject, object: GameObject, p: [string]): boolean => {
  return p[0] !== null && object.object(p[0]) !== null;
});

/**
 * todo;
 */
extern("xr_conditions.has_enemy", (actor: GameObject, object: GameObject): boolean => {
  return object.best_enemy() !== null;
});

/**
 * todo;
 */
extern("xr_conditions.has_actor_enemy", (actor: GameObject, object: GameObject): boolean => {
  const bestEnemy: Optional<GameObject> = object.best_enemy();

  return bestEnemy !== null && bestEnemy.id() === ACTOR_ID;
});

/**
 * todo;
 */
extern("xr_conditions.see_enemy", (actor: GameObject, object: GameObject): boolean => {
  const enemy: Optional<GameObject> = object.best_enemy();

  if (enemy !== null) {
    return object.see(enemy);
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.heavy_wounded", (actor: GameObject, object: GameObject): boolean => {
  return isObjectWounded(object.id());
});

/**
 * Whether object has active enemy.
 */
extern("xr_conditions.mob_has_enemy", (actor: GameObject, object: GameObject): boolean => {
  return object.get_enemy() !== null;
});

/**
 * Whether monster was hit recently.
 */
extern("xr_conditions.mob_was_hit", (actor: GameObject, object: GameObject): boolean => {
  const hitInfo: MonsterHitInfo = object.get_monster_hit_info();

  return hitInfo.who !== null && hitInfo.time !== 0;
});

/**
 * todo;
 */
extern("xr_conditions.squad_in_zone", (actor: GameObject, object: GameObject, p: [string, string]) => {
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
    zoneName = object.name();
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    return false;
  }

  const zone: GameObject = registry.zones.get(zoneName);

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
extern("xr_conditions.squad_has_enemy", (actor: GameObject, object: GameObject, p: [Optional<TStringId>]): boolean => {
  const storyId: Optional<TStringId> = p[0];

  if (storyId === null) {
    abort("Insufficient params in squad_has_enemy function. story_id [%s]", tostring(storyId));
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    return false;
  }

  for (const squadMember of squad.squad_members()) {
    const npcObject: Optional<GameObject> = level.object_by_id(squadMember.object.id);

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
extern("xr_conditions.squad_in_zone_all", (actor: GameObject, object: GameObject, p: [TStringId, TName]): boolean => {
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

  const zone: Optional<GameObject> = registry.zones.get(zoneName);

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
 * todo: use generic condition?
 */
extern("xr_conditions.squads_in_zone_b41", (actor: GameObject, object: GameObject): boolean => {
  const smartTerrain: Optional<SmartTerrain> = getManager(SimulationManager).getSmartTerrainByName("jup_b41");
  const zone: Optional<GameObject> = registry.zones.get("jup_b41_sr_light");

  if (zone === null) {
    return false;
  }

  if (smartTerrain === null) {
    return false;
  }

  for (const [k, v] of getManager(SimulationManager).getSmartTerrainDescriptor(smartTerrain.id)!.assignedSquads) {
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
  (actor: GameObject, object: ServerCreatureObject, [name]: [TName]): boolean => {
    if (!object || !name) {
      return false;
    }

    if (isStalker(object) || isMonster(object)) {
      const squad: Optional<Squad> = registry.simulator.object(object.group_id);

      if (squad === null) {
        return false;
      }

      if (string.find(squad.section_name(), name)[0] !== null) {
        return true;
      }
    }

    return object.section_name() === name;
  }
);

/**
 * todo;
 */
extern("xr_conditions.target_smart_name", (actor: GameObject, object: GameObject, p: [string]): boolean => {
  if (p[0] === null) {
    abort("Wrong parameters");
  }

  return object.name() === p[0];
});

/**
 * todo;
 */
extern(
  "xr_conditions.squad_exist",
  (actor: GameObject, object: GameObject, [squadStoryId]: [Optional<TStringId>]): boolean => {
    assert(squadStoryId, "Wrong parameter story_id[%s] in squad_exist function.", squadStoryId);

    return isStoryObjectExisting(squadStoryId);
  }
);

/**
 * todo;
 */
extern("xr_conditions.is_squad_commander", (actor: GameObject, object: AnyGameObject): boolean => {
  return isObjectSquadCommander(object);
});

/**
 * todo;
 */
extern("xr_conditions.squad_npc_count_ge", (actor: GameObject, object: GameObject, p: [string, string]): boolean => {
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
extern("xr_conditions.quest_npc_enemy_actor", (actor: GameObject, object: GameObject, p: [string]): boolean => {
  if (p[0] === null) {
    abort("wrong story id");
  } else {
    const object: Optional<GameObject> = getObjectByStoryId(p[0]);

    if (object && isStalker(object)) {
      const actor: Optional<GameObject> = registry.actor;

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
extern("xr_conditions.distance_to_obj_ge", (actor: GameObject, object: GameObject, p: [string, number]): boolean => {
  const objectId: Optional<TNumberId> = getObjectIdByStoryId(p[0]);
  const targetObject: Optional<ServerObject> = objectId ? registry.simulator.object(objectId) : null;

  if (targetObject) {
    return registry.actor.position().distance_to_sqr(targetObject.position) >= p[1] * p[1];
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.distance_to_obj_le", (actor: GameObject, object: GameObject, p: [string, number]): boolean => {
  const objectId: Optional<TNumberId> = getObjectIdByStoryId(p[0]);
  const targetObject: Optional<ServerObject> = objectId ? registry.simulator.object(objectId) : null;

  if (targetObject) {
    return registry.actor.position().distance_to_sqr(targetObject.position) < p[1] * p[1];
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.active_item", (actor: GameObject, object: GameObject, params: LuaArray<TSection>): boolean => {
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
  (actor: GameObject, object: Optional<GameObject>, p: [string, string]): boolean => {
    if ((p && p[0]) === null) {
      abort("Wrong parameters in function 'check_bloodsucker_state'!!!");
    }

    let state: string = p[0];

    if (p[1] !== null) {
      state = p[1];
      object = getObjectByStoryId(p[1]);
    }

    if (object !== null) {
      return object.get_visibility_state() === tonumber(state)!;
    }

    return false;
  }
);

/**
 * todo;
 */
extern("xr_conditions.in_dest_smart_cover", (actor: GameObject, object: GameObject): boolean => {
  return object.in_smart_cover();
});

/**
 * todo;
 */
extern("xr_conditions.dist_to_story_obj_ge", (actor: GameObject, object: GameObject, p: [string, number]): boolean => {
  const storyId: TStringId = p && p[0];
  const storyObjectId: Optional<TNumberId> = getObjectIdByStoryId(storyId);

  if (storyObjectId === null) {
    return true;
  }

  return registry.simulator.object(storyObjectId)!.position.distance_to(registry.actor.position()) > p[1];
});

/**
 * todo;
 */
extern("xr_conditions.has_enemy_in_current_loopholes_fov", (actor: GameObject, object: GameObject): boolean => {
  return (
    object.in_smart_cover() &&
    object.best_enemy() !== null &&
    object.in_current_loophole_fov(object.best_enemy()!.position())
  );
});

/**
 * todo;
 */
extern("xr_conditions.npc_talking", (actor: GameObject, object: GameObject): boolean => {
  return object.is_talking();
});

/**
 * todo;
 */
extern("xr_conditions.see_actor", (actor: GameObject, object: GameObject): boolean => {
  return object.alive() && object.see(actor);
});

/**
 * todo;
 */
extern("xr_conditions.object_exist", (actor: GameObject, object: GameObject, params: [string]): boolean => {
  return getObjectByStoryId(params[0]) !== null;
});

/**
 * todo;
 */
extern(
  "xr_conditions.squad_curr_action",
  (actor: GameObject, object: GameObject, [squadActionType]: [ESquadActionType]): boolean => {
    return getObjectSquad(object)!.currentAction?.type === squadActionType;
  }
);

/**
 * todo;
 */
extern("xr_conditions.check_enemy_smart", (actor: GameObject, object: GameObject, params: [string]): boolean => {
  const enemyId: Optional<TNumberId> = registry.objects.get(object.id()).enemyId;
  const enemy: Optional<GameObject> = enemyId ? registry.objects.get(enemyId)?.object : null;

  if (enemy === null || enemyId === ACTOR_ID) {
    return false;
  }

  const enemySmartTerrain: Optional<SmartTerrain> = getObjectSmartTerrain(enemy);

  return enemySmartTerrain !== null && enemySmartTerrain.name() === params[0];
});

/**
 * todo;
 */
extern("xr_conditions.polter_ignore_actor", (actor: GameObject, object: GameObject): boolean => {
  return object.poltergeist_get_actor_ignore();
});

/**
 * todo;
 */
extern("xr_conditions.burer_gravi_attack", (actor: GameObject, object: GameObject): boolean => {
  return object.burer_get_force_gravi_attack();
});

/**
 * todo;
 */
extern("xr_conditions.burer_anti_aim", (actor: GameObject, object: GameObject): boolean => {
  return object.burer_get_force_anti_aim();
});

/**
 * Whether object is playing any sound
 */
extern("xr_conditions.is_playing_sound", (actor: GameObject, object: GameObject): boolean => {
  return isPlayingSound(object);
});

/**
 * todo;
 */
extern("xr_conditions.is_door_blocked_by_npc", (actor: GameObject, object: GameObject): boolean => {
  return object.is_door_blocked_by_npc();
});

/**
 * Check if deimos phase is active in restrictor object.
 */
extern(
  "xr_conditions.check_deimos_phase",
  (
    actor: GameObject,
    object: GameObject,
    [bounds, direction]: [
      Optional<"disable_bound" | "lower_bound" | "upper_bound">,
      Optional<"increasing" | "decreasing">,
    ]
  ): boolean => {
    return bounds && direction ? isDeimosPhaseActive(object, bounds, direction === "increasing") : false;
  }
);

/**
 * todo;
 */
extern("xr_conditions.animpoint_reached", (actor: GameObject, object: GameObject): boolean => {
  const animpointState: Optional<ISchemeAnimpointState> = registry.objects.get(object.id())[
    SchemeAnimpoint.SCHEME_SECTION
  ] as Optional<ISchemeAnimpointState>;

  return animpointState !== null && animpointState.animpointManager.isPositionReached();
});

/**
 * todo;
 */
extern("xr_conditions.upgrade_hint_kardan", (actor: GameObject, object: GameObject, params: AnyArgs): boolean => {
  const itemUpgradeHints: LuaArray<TLabel> = new LuaTable();
  const toolsCount: TCount = (params && tonumber(params[0])) || 0;
  let canUpgrade: number = 0;

  if (!hasInfoPortion(infoPortions.zat_b3_all_instruments_brought)) {
    if (!hasInfoPortion(infoPortions.zat_b3_tech_instrument_1_brought) && (toolsCount === 0 || toolsCount === 1)) {
      table.insert(itemUpgradeHints, "st_upgr_toolkit_1");
    } else if (toolsCount === 1) {
      canUpgrade = canUpgrade + 1;
    }

    if (!hasInfoPortion(infoPortions.zat_b3_tech_instrument_2_brought) && (toolsCount === 0 || toolsCount === 2)) {
      table.insert(itemUpgradeHints, "st_upgr_toolkit_2");
    } else if (toolsCount === 2) {
      canUpgrade = canUpgrade + 1;
    }

    if (!hasInfoPortion(infoPortions.zat_b3_tech_instrument_3_brought) && (toolsCount === 0 || toolsCount === 3)) {
      table.insert(itemUpgradeHints, "st_upgr_toolkit_3");
    } else if (toolsCount === 3) {
      canUpgrade = canUpgrade + 1;
    }
  } else {
    canUpgrade = canUpgrade + 1;
  }

  if (!hasInfoPortion(infoPortions.zat_b3_tech_see_produce_62)) {
    if (toolsCount === 1 && !hasInfoPortion(infoPortions.zat_b3_tech_have_one_dose)) {
      table.insert(itemUpgradeHints, "st_upgr_vodka");
    } else if (toolsCount !== 1 && !hasInfoPortion(infoPortions.zat_b3_tech_have_couple_dose)) {
      table.insert(itemUpgradeHints, "st_upgr_vodka");
    } else {
      canUpgrade = canUpgrade + 1;
    }
  } else {
    canUpgrade = canUpgrade + 1;
  }

  getManager(UpgradesManager).setCurrentHints(itemUpgradeHints);

  return canUpgrade >= 2;
});
