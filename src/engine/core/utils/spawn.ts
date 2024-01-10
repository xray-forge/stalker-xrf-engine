import { clsid, level, patrol } from "xray16";

import { getManager, registry, SYSTEM_INI } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import { abort, assert } from "@/engine/core/utils/assertion";
import { isStalker } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectPositioning } from "@/engine/core/utils/position";
import { isAmmoSection } from "@/engine/core/utils/section";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import {
  AlifeSimulator,
  AnyGameObject,
  GameObject,
  LuaArray,
  Optional,
  Patrol,
  ServerObject,
  ServerPhysicObject,
  TCount,
  TDistance,
  TIndex,
  TName,
  TNumberId,
  TProbability,
  TRate,
  TSection,
  TStringId,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Spawn items of provided section for an object.
 *
 * @param object - target object to spawn items for
 * @param section - section of item
 * @param count - count of items to spawn
 * @param probability - probability to spawn item, 100% by default
 * @returns count of spawned items
 */
export function spawnItemsForObject(
  object: AnyGameObject,
  section: TSection,
  count: TCount = 1,
  probability: TProbability = 100
): TCount {
  if (count < 1 || probability <= 0) {
    return 0;
  } else if (isAmmoSection(section)) {
    return spawnAmmoForObject(object, section, count, probability);
  }

  let spawnedCount: TCount = 0;

  const simulator: AlifeSimulator = registry.simulator;
  const [id, gvid, lvid, position] = getObjectPositioning(object);

  for (const _ of $range(1, count)) {
    if (math.random(100) <= probability) {
      simulator.create(section, position, lvid, gvid, id);
      spawnedCount += 1;
    }
  }

  return spawnedCount;
}

/**
 * Spawn items of provided section for an object.
 *
 * @param section - section of item
 * @param gameVertexId - game vertex to spawn in
 * @param levelVertexId - level vertex to spawn in
 * @param position - target position to place items at
 * @param count - count of items to spawn
 * @param probability - probability to spawn item, 100% by default
 * @returns count of spawned items
 */
export function spawnItemsAtPosition(
  section: TSection,
  gameVertexId: TNumberId,
  levelVertexId: TNumberId,
  position: Vector,
  count: TCount = 1,
  probability: TProbability = 100
): TCount {
  if (count < 1 || probability <= 0) {
    return 0;
  } else if (isAmmoSection(section)) {
    return spawnAmmoAtPosition(section, gameVertexId, levelVertexId, position, count, probability);
  }

  let spawnedCount: TCount = 0;

  const simulator: AlifeSimulator = registry.simulator;

  for (const _ of $range(1, count)) {
    if (math.random(100) <= probability) {
      simulator.create(section, position, levelVertexId, gameVertexId, MAX_U16);
      spawnedCount += 1;
    }
  }

  return spawnedCount;
}

/**
 * Spawn ammo objects for provided object.
 *
 * @param object - target object to spawn items for
 * @param section - section of ammo item
 * @param count - count of ammo to spawn
 * @param probability - probability to spawn item, 100% by default
 * @returns count of spawned ammo
 */
export function spawnAmmoForObject(
  object: AnyGameObject,
  section: TSection,
  count: TCount,
  probability: TProbability = 100
): TCount {
  if (count < 1 || probability <= 0) {
    return 0;
  }

  const [id, gvid, lvid, position] = getObjectPositioning(object);
  const countInBox: TCount = SYSTEM_INI.r_u32(section, "box_size");

  let ammoSpawned: TCount = 0;

  /**
   * Game engine limits ammo to spawn in boxes.
   * Everything in one transaction bigger than `box_size` will cause an exception.
   */
  if (math.random(100) <= probability) {
    while (count > countInBox) {
      registry.simulator.create_ammo(section, position, lvid, gvid, id, countInBox);

      count -= countInBox;
      ammoSpawned += countInBox;
    }

    registry.simulator.create_ammo(section, position, lvid, gvid, id, count);
    ammoSpawned += count;
  }

  return ammoSpawned;
}

/**
 * Spawn ammo objects at provided position.
 *
 * @param section - section of ammo item
 * @param gameVertexId - game vertex to spawn in
 * @param levelVertexId - level vertex to spawn in
 * @param position - target position to place items at
 * @param count - count of ammo to spawn
 * @param probability - probability to spawn item, 100% by default
 * @returns count of spawned ammo
 */
export function spawnAmmoAtPosition(
  section: TSection,
  gameVertexId: TNumberId,
  levelVertexId: TNumberId,
  position: Vector,
  count: TCount,
  probability: TProbability = 100
): TCount {
  if (count < 1 || probability <= 0) {
    return 0;
  }

  const countInBox: TCount = SYSTEM_INI.r_u32(section, "box_size");

  let ammoSpawned: TCount = 0;

  /**
   * Game engine limits ammo to spawn in boxes.
   * Everything in one transaction bigger than `box_size` will cause an exception.
   */
  if (math.random(100) <= probability) {
    while (count > countInBox) {
      registry.simulator.create_ammo(section, position, levelVertexId, gameVertexId, MAX_U16, countInBox);

      count -= countInBox;
      ammoSpawned += countInBox;
    }

    registry.simulator.create_ammo(section, position, levelVertexId, gameVertexId, MAX_U16, count);
    ammoSpawned += count;
  }

  return ammoSpawned;
}

/**
 * Spawn random items from provided lists for an object.
 *
 * @param object - target object to spawn items for
 * @param itemSections - list of possible sections
 * @param count - count of items to spawn
 */
export function spawnItemsForObjectFromList<T extends TSection>(
  object: AnyGameObject,
  itemSections: LuaArray<T>,
  count: TCount = 1
): void {
  if (count < 1 || itemSections.length() < 1) {
    return;
  }

  for (const _ of $range(1, count)) {
    spawnItemsForObject(object, table.random(itemSections)[1]);
  }
}

/**
 * Spawn new squad with provided story id in a smart terrain.
 *
 * @param section - squad section to spawn
 * @param smartTerrainName - name of smart terrain to spawn in
 * @returns spawned squad
 */
export function spawnSquadInSmart(section: Optional<TStringId>, smartTerrainName: Optional<TName>): Squad {
  assert(section, "Wrong squad identifier in spawnSquad function.");
  assert(smartTerrainName, "Wrong squad name in spawnSquad function.");
  assert(SYSTEM_INI.section_exist(section), "Wrong squad identifier '%s'. Squad doesnt exist in ini.", section);

  const simulationBoardManager: SimulationManager = getManager(SimulationManager);
  const smartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainByName(smartTerrainName);

  assert(smartTerrain, "Wrong smartName '%s' for faction in spawnSquad function.", tostring(smartTerrainName));

  const squad: Squad = simulationBoardManager.createSquad(smartTerrain, section);

  for (const squadMember of squad.squad_members()) {
    simulationBoardManager.setupObjectSquadAndGroup(squadMember.object);
  }

  squad.update();

  return squad;
}

/**
 * Spawn new object.
 *
 * @param section - object section to spawn
 * @param pathName - target pathname to spawn
 * @param index - patrol path index
 * @param yaw - spawned object yaw
 */
export function spawnObject<T extends ServerObject>(
  section: Optional<TSection>,
  pathName: Optional<TName>,
  index: TIndex = 0,
  yaw: TRate = 0
): T {
  logger.format("Spawn object: %s %s", section, pathName);

  assert(section, "Wrong spawn section for 'spawnObject' function '%s'.", section);
  assert(pathName, "Wrong spawn pathName for 'spawnObject' function '%s'.", pathName);
  assert(level.patrol_path_exists(pathName), "Path %s doesnt exist. Function 'spawnObject'.", pathName);

  const objectPatrol: Patrol = new patrol(pathName);

  const serverObject: ServerObject = registry.simulator.create(
    section,
    objectPatrol.point(index),
    objectPatrol.level_vertex_id(0),
    objectPatrol.game_vertex_id(0)
  );

  if (isStalker(serverObject)) {
    serverObject.o_torso().yaw = (yaw * math.pi) / 180;
  } else if (serverObject.clsid() === clsid.script_phys) {
    (serverObject as ServerPhysicObject).set_yaw((yaw * math.pi) / 180);
  }

  return serverObject as T;
}

/**
 * Spawn new object in object (chest, stalker etc).
 *
 * @param section - item section to spawn
 * @param targetId - id of object to spawn in
 * @returns newly create server object
 */
export function spawnObjectInObject<T extends ServerObject>(
  section: Optional<TSection>,
  targetId: Optional<TNumberId>
): T {
  // logger.format("Spawn in object: %s %s", section, targetId);

  if (!section || !targetId) {
    abort("Wrong spawn configuration for 'spawnObjectInObject', '%s' and '%s'.", section, targetId);
  }

  const box: Optional<ServerObject> = registry.simulator.object(targetId);

  if (!box) {
    abort("Wrong spawn target object for 'spawnObjectInObject' function '%s'.", section);
  }

  return registry.simulator.create(section, createEmptyVector(), 0, 0, targetId);
}

/**
 * Release object by provided ID.
 * Prints warning if object is not found in registry.
 *
 * @param objectId - object id to release
 */
export function releaseObject(objectId: TNumberId): void {
  const serverObject: Optional<ServerObject> = registry.simulator.object(objectId);

  logger.format("Destroying object: %s", objectId);

  if (serverObject) {
    registry.simulator.release(serverObject, true);
  } else {
    logger.format("No existing object to destroy: %s", objectId);
  }
}

/**
 * Spawn creature based on actor sight direction, near actor.
 *
 * @param section - section to spawn
 * @param distance - distance to spawn from actor
 * @returns newly created server object
 */
export function spawnCreatureNearActor<T extends ServerObject>(section: TSection, distance: TDistance): T {
  const actor: GameObject = registry.actor;

  return registry.simulator.create(
    section,
    actor.position().add(actor.direction().mul(distance)),
    actor.level_vertex_id(),
    actor.game_vertex_id()
  );
}
