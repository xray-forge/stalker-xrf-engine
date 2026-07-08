import { clsid, level, patrol } from "xray16";
import {
  AlifeSimulator,
  AnyGameObject,
  GameObject,
  Patrol,
  ServerObject,
  ServerPhysicObject,
  Vector,
} from "xray16/alias";
import {
  abort,
  assert,
  createEmptyVector,
  LuaArray,
  Nillable,
  TCount,
  TDistance,
  TIndex,
  TName,
  TNumberId,
  TProbability,
  TRate,
  TSection,
} from "xray16/lib";
import { $filename } from "xray16/macros";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import {
  createSimulationSquad,
  getSimulationTerrainByName,
  setupSimulationObjectSquadAndGroup,
} from "@/engine/core/managers/simulation/utils";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import { isStalker } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectPositioning } from "@/engine/core/utils/position";
import { isAmmoSection } from "@/engine/core/utils/section";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Spawn items of provided section for an object.
 *
 * @param object - Target object to spawn items for.
 * @param section - Section of item.
 * @param count - Count of items to spawn.
 * @param probability - Probability to spawn item, 100% by default.
 * @returns Count of spawned items.
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
 * @param section - Section of item.
 * @param gameVertexId - Game vertex to spawn in.
 * @param levelVertexId - Level vertex to spawn in.
 * @param position - Target position to place items at.
 * @param count - Count of items to spawn.
 * @param probability - Probability to spawn item, 100% by default.
 * @returns Count of spawned items.
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
      simulator.create(section, position, levelVertexId, gameVertexId, MAX_ALIFE_ID);
      spawnedCount += 1;
    }
  }

  return spawnedCount;
}

/**
 * Spawn ammo objects for provided object.
 *
 * @param object - Target object to spawn items for.
 * @param section - Section of ammo item.
 * @param count - Count of ammo to spawn.
 * @param probability - Probability to spawn item, 100% by default.
 * @returns Count of spawned ammo.
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
 * @param section - Section of ammo item.
 * @param gameVertexId - Game vertex to spawn in.
 * @param levelVertexId - Level vertex to spawn in.
 * @param position - Target position to place items at.
 * @param count - Count of ammo to spawn.
 * @param probability - Probability to spawn item, 100% by default.
 * @returns Count of spawned ammo.
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
      registry.simulator.create_ammo(section, position, levelVertexId, gameVertexId, MAX_ALIFE_ID, countInBox);

      count -= countInBox;
      ammoSpawned += countInBox;
    }

    registry.simulator.create_ammo(section, position, levelVertexId, gameVertexId, MAX_ALIFE_ID, count);
    ammoSpawned += count;
  }

  return ammoSpawned;
}

/**
 * Spawn random items from provided lists for an object.
 *
 * @param object - Target object to spawn items for.
 * @param itemSections - List of possible sections.
 * @param count - Count of items to spawn.
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
 * @param section - Squad section to spawn.
 * @param terrainName - Name of smart terrain to spawn in.
 * @returns Spawned squad.
 */
export function spawnSquadInSmart(section: Nillable<TSection>, terrainName: Nillable<TName>): Squad {
  assert(section, "Wrong squad identifier in spawnSquad function.");
  assert(terrainName, "Wrong squad name in spawnSquad function.");
  assert(SYSTEM_INI.section_exist(section), "Wrong squad identifier '%s'. Squad doesnt exist in ini.", section);

  const terrain: Nillable<SmartTerrain> = getSimulationTerrainByName(terrainName);

  assert(terrain, "Wrong terrain name '%s' for faction in spawnSquadInSmart function.", tostring(terrainName));

  const squad: Squad = createSimulationSquad(terrain, section);

  // Probably not needed duplicate code.
  for (const squadMember of squad.squad_members()) {
    setupSimulationObjectSquadAndGroup(squadMember.object);
  }

  squad.update();

  return squad;
}

/**
 * Spawn new object.
 *
 * @param section - Object section to spawn.
 * @param pathName - Target pathname to spawn.
 * @param index - Patrol path index.
 * @param yaw - Spawned object yaw.
 */
export function spawnObject<T extends ServerObject>(
  section: Nillable<TSection>,
  pathName: Nillable<TName>,
  index: TIndex = 0,
  yaw: TRate = 0
): T {
  logger.info("Spawn object: %s %s", section, pathName);

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
 * @param section - Item section to spawn.
 * @param targetId - Id of object to spawn in.
 * @returns Newly create server object.
 */
export function spawnObjectInObject<T extends ServerObject>(
  section: Nillable<TSection>,
  targetId: Nillable<TNumberId>
): T {
  // logger.format("Spawn in object: %s %s", section, targetId);

  if (!section || !targetId) {
    abort("Wrong spawn configuration for 'spawnObjectInObject', '%s' and '%s'.", section, targetId);
  }

  const box: Nillable<ServerObject> = registry.simulator.object(targetId);

  if (!box) {
    abort("Wrong spawn target object for 'spawnObjectInObject' function '%s'.", section);
  }

  return registry.simulator.create(section, createEmptyVector(), 0, 0, targetId);
}

/**
 * Release object by provided ID.
 * Prints warning if object is not found in registry.
 *
 * @param objectId - Object id to release.
 */
export function releaseObject(objectId: TNumberId): void {
  const serverObject: Nillable<ServerObject> = registry.simulator.object(objectId);

  logger.info("Destroying object: %s", objectId);

  if (serverObject) {
    registry.simulator.release(serverObject, true);
  } else {
    logger.info("No existing object to destroy: %s", objectId);
  }
}

/**
 * Spawn creature based on actor sight direction, near actor.
 *
 * @param section - Section to spawn.
 * @param distance - Distance to spawn from actor.
 * @returns Newly created server object.
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
