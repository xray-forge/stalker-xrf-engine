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
import { getObjectId } from "@/engine/core/utils/object";
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
  TLabel,
  TName,
  TNumberId,
  TRate,
  TSection,
  TStringId,
} from "@/engine/lib/types";

/**
 * Check if object is snork.
 */
extern("xr_conditions.is_monster_snork", (_: GameObject, object: GameObject): boolean => {
  return isSnork(object);
});

/**
 * Check if object is dog.
 */
extern("xr_conditions.is_monster_dog", (_: GameObject, object: GameObject): boolean => {
  return isDog(object);
});

/**
 * Check if object is psy dog.
 */
extern("xr_conditions.is_monster_psy_dog", (_: GameObject, object: GameObject): boolean => {
  return isPsyDog(object);
});

/**
 * Check if object is poltergeist.
 */
extern("xr_conditions.is_monster_polter", (_: GameObject, object: GameObject): boolean => {
  return isPoltergeist(object);
});

/**
 * Check if object is tushkano.
 */
extern("xr_conditions.is_monster_tushkano", (_: GameObject, object: GameObject): boolean => {
  return isTushkano(object);
});

/**
 * Check if object is burer.
 */
extern("xr_conditions.is_monster_burer", (_: GameObject, object: GameObject): boolean => {
  return isBurer(object);
});

/**
 * Check if object is controller.
 */
extern("xr_conditions.is_monster_controller", (_: GameObject, object: GameObject): boolean => {
  return isController(object);
});

/**
 * Check if object is flesh.
 */
extern("xr_conditions.is_monster_flesh", (_: GameObject, object: GameObject): boolean => {
  return isFlesh(object);
});

/**
 * Check if object is boar.
 */
extern("xr_conditions.is_monster_boar", (_: GameObject, object: GameObject): boolean => {
  return isBoar(object);
});

/**
 * Check if distance between actor and object greater or equal.
 *
 * Where:
 * - distance - number to check against
 */
extern("xr_conditions.fighting_dist_ge", (actor: GameObject, object: GameObject, [distance]: [TDistance]): boolean => {
  return isDistanceBetweenObjectsGreaterOrEqual(actor, object, distance);
});

/**
 * Check if distance between actor and object less or equal.
 *
 * Where:
 * - distance - number to check against
 */
extern("xr_conditions.fighting_dist_le", (actor: GameObject, object: GameObject, [distance]: [TDistance]): boolean => {
  return isDistanceBetweenObjectsLessOrEqual(actor, object, distance);
});

/**
 * Check if object enemy (actor) is in zone.
 *
 * Where:
 * - name - name of zone object to check
 *
 * Throws, if zone with provided name does not exist.
 */
extern("xr_conditions.enemy_in_zone", (_: GameObject, __: GameObject, [name]: [TName]): boolean => {
  const zone: Optional<GameObject> = registry.zones.get(name) as Optional<GameObject>;

  return zone
    ? isObjectInZone(registry.actor, zone)
    : abort("Unexpected zone name '%s' in enemy_in_zone xr condition.", name);
});

/**
 * Check if object name matches one of provided parameters.
 *
 * Where:
 * - parameters - variadic list of strings to match object name
 */
extern("xr_conditions.check_npc_name", (_: GameObject, object: GameObject, params: LuaArray<TName>): boolean => {
  const objectName: TName = object.name();

  for (const [, name] of ipairs(params)) {
    if (string.find(objectName, name)[0]) {
      return true;
    }
  }

  return false;
});

/**
 * Check if object enemy is alive and enemy name is matching.
 *
 * Where:
 * - params - variadic list of strings to match object enemy name
 */
extern("xr_conditions.check_enemy_name", (_: GameObject, object: GameObject, params: LuaArray<TName>): boolean => {
  const enemy: Optional<GameObject> = registry.objects.get(object.id()).enemy;

  if (enemy && enemy.alive()) {
    const enemyName: TName = enemy.name();

    for (const [, name] of ipairs(params)) {
      if (string.find(enemyName, name)[0]) {
        return true;
      }
    }
  }

  return false;
});

/**
 * Check if object can see another object with provided story id.
 *
 * Where:
 * - storyId - story object id to check being seen by object
 */
extern("xr_conditions.see_npc", (_: GameObject, object: GameObject, [storyId]: [TStringId]): boolean => {
  const target: Optional<GameObject> = getObjectByStoryId(storyId);

  return target ? object.see(target) : false;
});

/**
 * Check if object is currently wounded and using wounded scheme.
 */
extern("xr_conditions.is_wounded", (_: GameObject, object: GameObject): boolean => {
  return isObjectWounded(object.id());
});

/**
 * Check if distance from object in smart terrain to another working object with matching job section is less or equals.
 *
 * Where:
 * - section - job section to check
 * - distance - number value to check as distance
 */
extern(
  "xr_conditions.distance_to_obj_on_job_le",
  (_: GameObject, object: GameObject, [section, distance]: [TSection, TDistance]): boolean => {
    const terrain: SmartTerrain = getObjectSmartTerrain(object)!;

    for (const [, descriptor] of terrain.objectJobDescriptors) {
      if (descriptor.job && descriptor.job.section === section) {
        return object.position().distance_to_sqr(descriptor.object.position) <= distance * distance;
      }
    }

    return false;
  }
);

/**
 * Check if object is on specific job in specific smart terrain.
 *
 * Where:
 * - section - job section to check
 * - terrainName - name of smart terrain to check
 */
extern(
  "xr_conditions.is_obj_on_job",
  (_: GameObject, object: GameObject, [section, terrainName]: [TSection, Optional<TName>]): boolean => {
    const terrain: Optional<SmartTerrain> = terrainName
      ? getManager(SimulationManager).getSmartTerrainByName(terrainName)
      : getObjectSmartTerrain(object);

    if (!terrain) {
      return false;
    }

    for (const [, descriptor] of terrain.objectJobDescriptors) {
      if (descriptor.job && descriptor.job.section === section) {
        return true;
      }
    }

    return false;
  }
);

/**
 * Check if at least one of provided story ID objects is inside zone object.
 *
 * Where:
 * - params - variadic list of story IDs to check presence in current zone object
 */
extern("xr_conditions.obj_in_zone", (_: GameObject, object: GameObject, params: Array<TStringId>): boolean => {
  const simulator: AlifeSimulator = registry.simulator;

  for (const [, storyId] of ipairs(params)) {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(storyId);

    if (objectId && object.inside(simulator.object(objectId)!.position)) {
      return true;
    }
  }

  return false;
});

/**
 * Check if object health is less than provided value.
 *
 * Where:
 * - health - number value between 0 and 1 to check against
 */
extern("xr_conditions.health_le", (_: GameObject, object: GameObject, [health]: [Optional<TRate>]): boolean => {
  return health !== null && object.health < health;
});

/**
 * Check if helicopter object health is less than provided value.
 *
 * Where:
 * - health - number value between 0 and 1 to check against
 */
extern("xr_conditions.heli_health_le", (_: GameObject, object: GameObject, [health]: [Optional<TRate>]): boolean => {
  return health !== null && object.get_helicopter().GetfHealth() < health;
});

/**
 * Check if story ID object is in zone with provided name.
 *
 * Where:
 * - storyId - story ID of object to check
 * - zoneName - name of zone object to check object in
 */
extern(
  "xr_conditions.story_obj_in_zone_by_name",
  (_: GameObject, __: GameObject, [storyId, zoneName]: [TStringId, TName]): boolean => {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(storyId);
    const zone: Optional<GameObject> = registry.zones.get(zoneName);

    if (objectId && zone) {
      return zone.inside(registry.simulator.object(objectId)!.position);
    }

    return false;
  }
);

/**
 * Check if object is in provided zone name.
 *
 * Where:
 * - zoneName - name of the zone object to check object is inside
 */
extern(
  "xr_conditions.npc_in_zone",
  (_: GameObject, object: GameObject | ServerObject, [zoneName]: [TName]): boolean => {
    const zone: Optional<GameObject> = registry.zones.get(zoneName) as Optional<GameObject>;

    if (type(object.id) === "function") {
      return isObjectInZone(object as GameObject, zone);
    }

    if (zone) {
      const registryObject: Optional<GameObject> = registry.objects.get((object as ServerObject).id)
        ?.object as Optional<GameObject>;

      return registryObject ? isObjectInZone(registryObject, zone) : zone.inside((object as ServerObject).position);
    }

    return true;
  }
);

/**
 * Check if helicopter object sees object with provided story ID.
 *
 * Where:
 * - storyId - story ID of the object to check visibility by helicopter object
 */
extern("xr_conditions.heli_see_npc", (_: GameObject, object: GameObject, [storyId]: [Optional<TStringId>]): boolean => {
  if (storyId) {
    const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

    return storyObject ? object.get_helicopter().isVisible(storyObject) : false;
  }

  return false;
});

/**
 * Check if object is hit by one of provided story ID objects.
 *
 * Where:
 * - parameters - variadic list of story IDs to check
 */
extern("xr_conditions.hitted_by", (_: GameObject, object: GameObject, parameters: Array<TStringId>): boolean => {
  const state: Optional<ISchemeHitState> = registry.objects.get(object.id())[EScheme.HIT] as ISchemeHitState;

  if (!state) {
    return false;
  }

  for (const [, storyId] of ipairs(parameters)) {
    const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

    // todo: Probably taking ID by SID is enough for comparison here.
    if (storyObject && state.who === storyObject.id()) {
      return true;
    }
  }

  return false;
});

/**
 * Check whether object was hit in bone with on of provided string identifiers.
 *
 * Where:
 * - parameters - variadic list of bone IDs to match against
 */
extern("xr_conditions.hitted_on_bone", (_: GameObject, object: GameObject, parameters: Array<TStringId>): boolean => {
  const state: Optional<ISchemeHitState> = registry.objects.get(object.id())[EScheme.HIT] as ISchemeHitState;

  if (!state) {
    return false;
  }

  for (const [, boneId] of ipairs(parameters)) {
    if (object.get_bone_id(boneId) === state.boneIndex) {
      return true;
    }
  }

  return false;
});

/**
 * Check if object has any pistol in pistol slot (`1`).
 */
extern("xr_conditions.best_pistol", (_: GameObject, object: GameObject): boolean => {
  return object.item_in_slot(1) !== null;
});

/**
 * Check if deadly hit is set in object hit scheme.
 */
extern("xr_conditions.deadly_hit", (_: GameObject, object: GameObject): boolean => {
  return (registry.objects.get(object.id())[EScheme.HIT] as ISchemeHitState)?.isDeadlyHit === true;
});

/**
 * Check if object was killed by one of provided story IDs.
 *
 * Where:
 * - parameters - variadic list of story IDs to check
 */
extern("xr_conditions.killed_by", (_: GameObject, object: GameObject, parameters: Array<TStringId>): boolean => {
  const state: Optional<ISchemeDeathState> = registry.objects.get(object.id())[EScheme.DEATH] as ISchemeDeathState;

  if (!state) {
    return false;
  }

  for (const [, storyId] of ipairs(parameters)) {
    const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

    // todo: Probably getting story link is enough.
    if (storyObject && state.killerId === storyObject.id()) {
      return true;
    }
  }

  return false;
});

/**
 * Check if all story IDs objects are alive.
 * Ensures all story ID objects are stalkers and alive.
 *
 * Notes:
 * - Returns true if provided story IDs list is empty
 * - Returns false if object with provided story ID is not found
 * - Returns false if provided story ID object is not stalker
 *
 * Where:
 * - parameters - variadic list of story IDs
 */
extern("xr_conditions.is_alive_all", (_: GameObject, __: GameObject, parameters: Array<TStringId>): boolean => {
  const simulator: AlifeSimulator = registry.simulator;

  for (const [, storyId] of ipairs(parameters)) {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(storyId);

    if (objectId) {
      const serverObject: Optional<ServerObject> = simulator.object(objectId);

      if (serverObject && (!isStalker(serverObject) || !serverObject.alive())) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
});

/**
 * Check if at least one story IDs object is alive and is stalker.
 *
 * Notes:
 * - Returns false if provided story IDs list is empty
 * - Returns true only if at least one object is alive stalker
 *
 * Where:
 * - parameters - variadic list of story IDs
 */
extern("xr_conditions.is_alive_one", (_: GameObject, __: GameObject, parameters: Array<TStringId>): boolean => {
  for (const [, storyId] of ipairs(parameters)) {
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(storyId);

    if (objectId) {
      const object: Optional<ServerObject> = registry.simulator.object(objectId);

      if (object && isStalker(object) && object.alive()) {
        return true;
      }
    } else {
      return false;
    }
  }

  return false;
});

/**
 * Check if provided story ID object is alive and is stalker entity.
 * Runs checks against current object if story ID is not provided.
 *
 * Where:
 * - storyId - optional story ID of object to check
 */
extern("xr_conditions.is_alive", (_: GameObject, object: AnyGameObject, [storyId]: [Optional<TStringId>]): boolean => {
  const objectId: Optional<TNumberId> = storyId ? getObjectIdByStoryId(storyId) : getObjectId(object);

  // todo: Handle all three cases more gracefully.
  if (objectId) {
    const serverObject: Optional<ServerObject> = registry.simulator.object(objectId);

    return serverObject !== null && isStalker(serverObject) && serverObject.alive();
  } else {
    return false;
  }
});

/**
 * Check if object is dead or not existing by story ID.
 *
 * Where:
 * - storyId - optional story ID of object to check
 */
extern("xr_conditions.is_dead", (_: GameObject, __: GameObject, [storyId]: [TStringId]): boolean => {
  const storyObject: Optional<GameObject> = getObjectByStoryId(storyId);

  return !storyObject || !storyObject.alive();
});

/**
 * Check if object with provided story ID exists.
 *
 * Where:
 * - storyId - optional story ID of object to check
 */
extern("xr_conditions.story_object_exist", (_: GameObject, __: GameObject, [storyId]: [TStringId]): boolean => {
  return getObjectByStoryId(storyId) !== null;
});

/**
 * Whether object has item in inventory.
 */
extern("xr_conditions.npc_has_item", (_: GameObject, object: GameObject, [section]: [Optional<TSection>]): boolean => {
  return section !== null && object.object(section) !== null;
});

/**
 * Whether object has active enemy.
 */
extern("xr_conditions.has_enemy", (_: GameObject, object: GameObject): boolean => {
  return object.best_enemy() !== null;
});

/**
 * Whether object has actor as active enemy.
 */
extern("xr_conditions.has_actor_enemy", (_: GameObject, object: GameObject): boolean => {
  return object.best_enemy()?.id() === ACTOR_ID;
});

/**
 * Whether object has enemy and see it.
 */
extern("xr_conditions.see_enemy", (_: GameObject, object: GameObject): boolean => {
  const enemy: Optional<GameObject> = object.best_enemy();

  if (enemy) {
    return object.see(enemy);
  }

  return false;
});

/**
 * Whether object has active enemy.
 */
extern("xr_conditions.mob_has_enemy", (_: GameObject, object: GameObject): boolean => {
  return object.get_enemy() !== null;
});

/**
 * Whether monster was hit recently.
 */
extern("xr_conditions.mob_was_hit", (_: GameObject, object: GameObject): boolean => {
  const hitInfo: MonsterHitInfo = object.get_monster_hit_info();

  return hitInfo.who !== null && hitInfo.time !== 0;
});

/**
 * Check if at least one squad member is in target zone.
 *
 * Where:
 * - storyId - story ID of the squad
 * - zoneName - name of the zone to check (current object will be checked by default)
 */
extern(
  "xr_conditions.squad_in_zone",
  (_: GameObject, object: GameObject, [storyId, zoneName]: [Optional<TStringId>, Optional<TName>]): boolean => {
    const squad: Optional<Squad> = storyId
      ? getServerObjectByStoryId(storyId)
      : abort("Incorrect 'squad_in_zone' condition parameters: storyId '%s', zoneName '%s'.", storyId, zoneName);

    if (!squad) {
      return false;
    }

    const zone: Optional<GameObject> = registry.zones.get(zoneName ?? object.name()) as Optional<GameObject>;

    if (zone) {
      for (const squadMember of squad.squad_members()) {
        if (zone.inside(registry.objects.get(squadMember.id)?.object?.position() ?? squadMember.object.position)) {
          return true;
        }
      }
    }

    return false;
  }
);

/**
 * Check whether all squad members are in zone.
 *
 * Params:
 * - storyId - story ID of the squad to check
 * - zoneName - target zone name
 *
 * Notes:
 * - Returns true is squad is empty
 */
extern(
  "xr_conditions.squad_in_zone_all",
  (_: GameObject, __: GameObject, [storyId, zoneName]: [TStringId, TName]): boolean => {
    if (!storyId || !zoneName) {
      abort("Incorrect params in 'squad_in_zone_all' condition: storyId '%s', zoneName '%s'", storyId, zoneName);
    }

    const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

    if (!squad) {
      return false;
    }

    const zone: Optional<GameObject> = registry.zones.get(zoneName);

    if (zone) {
      for (const squadMember of squad.squad_members()) {
        if (!zone.inside(registry.objects.get(squadMember.id)?.object?.position() ?? squadMember.object.position)) {
          return false;
        }
      }
    }

    return true;
  }
);

/**
 * Check whether any squad member has any enemy.
 *
 * Params:
 * - storyId - story ID of the squad to check
 */
extern("xr_conditions.squad_has_enemy", (_: GameObject, __: GameObject, [storyId]: [Optional<TStringId>]): boolean => {
  if (!storyId) {
    abort("Incorrect params in 'squad_has_enemy' condition: storyId '%s'.", storyId);
  }

  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad) {
    for (const squadMember of squad.squad_members()) {
      // todo: Check from registry?
      const squadObject: Optional<GameObject> = level.object_by_id(squadMember.object.id);

      if (!squadObject) {
        return false;
      } else if (squadObject.best_enemy()) {
        return true;
      }
    }
  }

  return false;
});

/**
 * todo;
 * todo: use generic condition?
 */
extern("xr_conditions.squads_in_zone_b41", (): boolean => {
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
extern("xr_conditions.target_squad_name", (_: GameObject, object: ServerCreatureObject, [name]: [TName]): boolean => {
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
});

/**
 * todo;
 */
extern("xr_conditions.target_smart_name", (_: GameObject, object: GameObject, p: [string]): boolean => {
  if (p[0] === null) {
    abort("Wrong parameters");
  }

  return object.name() === p[0];
});

/**
 * todo;
 */
extern("xr_conditions.squad_exist", (_: GameObject, __: GameObject, [squadStoryId]: [Optional<TStringId>]): boolean => {
  assert(squadStoryId, "Wrong parameter story_id[%s] in squad_exist function.", squadStoryId);

  return isStoryObjectExisting(squadStoryId);
});

/**
 * todo;
 */
extern("xr_conditions.is_squad_commander", (_: GameObject, object: AnyGameObject): boolean => {
  return isObjectSquadCommander(object);
});

/**
 * todo;
 */
extern("xr_conditions.squad_npc_count_ge", (_: GameObject, __: GameObject, p: [string, string]): boolean => {
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
extern("xr_conditions.quest_npc_enemy_actor", (_: GameObject, __: GameObject, p: [string]): boolean => {
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
extern("xr_conditions.distance_to_obj_ge", (_: GameObject, __: GameObject, p: [string, number]): boolean => {
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
extern("xr_conditions.distance_to_obj_le", (_: GameObject, __: GameObject, p: [string, number]): boolean => {
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
extern("xr_conditions.active_item", (actor: GameObject, __: GameObject, params: LuaArray<TSection>): boolean => {
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
  (_: GameObject, object: Optional<GameObject>, p: [string, string]): boolean => {
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
 * Whether object is in smart cover.
 */
extern("xr_conditions.in_dest_smart_cover", (_: GameObject, object: GameObject): boolean => {
  return object.in_smart_cover();
});

/**
 * todo;
 */
extern("xr_conditions.dist_to_story_obj_ge", (_: GameObject, __: GameObject, p: [string, number]): boolean => {
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
extern("xr_conditions.has_enemy_in_current_loopholes_fov", (_: GameObject, object: GameObject): boolean => {
  return (
    object.in_smart_cover() &&
    object.best_enemy() !== null &&
    object.in_current_loophole_fov(object.best_enemy()!.position())
  );
});

/**
 * Whether object is talking.
 */
extern("xr_conditions.npc_talking", (_: GameObject, object: GameObject): boolean => {
  return object.is_talking();
});

/**
 * Whether object is alive and see actor.
 */
extern("xr_conditions.see_actor", (actor: GameObject, object: GameObject): boolean => {
  return object.alive() && object.see(actor);
});

/**
 * Whether object with provided story ID exists.
 */
extern("xr_conditions.object_exist", (_: GameObject, __: GameObject, [storyId]: [TStringId]): boolean => {
  return getObjectByStoryId(storyId) !== null;
});

/**
 * todo;
 */
extern(
  "xr_conditions.squad_curr_action",
  (_: GameObject, object: GameObject, [squadActionType]: [ESquadActionType]): boolean => {
    return getObjectSquad(object)!.currentAction?.type === squadActionType;
  }
);

/**
 * todo;
 */
extern("xr_conditions.check_enemy_smart", (_: GameObject, object: GameObject, params: [string]): boolean => {
  const enemyId: Optional<TNumberId> = registry.objects.get(object.id()).enemyId;
  const enemy: Optional<GameObject> = enemyId ? registry.objects.get(enemyId)?.object : null;

  if (enemy === null || enemyId === ACTOR_ID) {
    return false;
  }

  const enemySmartTerrain: Optional<SmartTerrain> = getObjectSmartTerrain(enemy);

  return enemySmartTerrain !== null && enemySmartTerrain.name() === params[0];
});

/**
 * Whether poltergeist has actor ignoring enabled.
 */
extern("xr_conditions.polter_ignore_actor", (_: GameObject, object: GameObject): boolean => {
  return object.poltergeist_get_actor_ignore();
});

/**
 * Whether burer uses gravi attack.
 */
extern("xr_conditions.burer_gravi_attack", (_: GameObject, object: GameObject): boolean => {
  return object.burer_get_force_gravi_attack();
});

/**
 * Whether burer uses anti-aim force.
 */
extern("xr_conditions.burer_anti_aim", (_: GameObject, object: GameObject): boolean => {
  return object.burer_get_force_anti_aim();
});

/**
 * Whether object is playing any sound
 */
extern("xr_conditions.is_playing_sound", (_: GameObject, object: GameObject): boolean => {
  return isPlayingSound(object);
});

/**
 * todo;
 */
extern("xr_conditions.is_door_blocked_by_npc", (_: GameObject, object: GameObject): boolean => {
  return object.is_door_blocked_by_npc();
});

/**
 * Check if deimos phase is active in restrictor object.
 */
extern(
  "xr_conditions.check_deimos_phase",
  (
    _: GameObject,
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
extern("xr_conditions.animpoint_reached", (_: GameObject, object: GameObject): boolean => {
  const animpointState: Optional<ISchemeAnimpointState> = registry.objects.get(object.id())[
    SchemeAnimpoint.SCHEME_SECTION
  ] as Optional<ISchemeAnimpointState>;

  return animpointState !== null && animpointState.animpointManager.isPositionReached();
});

/**
 * todo;
 */
extern("xr_conditions.upgrade_hint_kardan", (_: GameObject, __: GameObject, params: AnyArgs): boolean => {
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
