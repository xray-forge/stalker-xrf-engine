import { clsid, game, level, patrol } from "xray16";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
import { isStalker } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectPositioning } from "@/engine/core/utils/position";
import { isAmmoSection } from "@/engine/core/utils/section";
import { createEmptyVector } from "@/engine/core/utils/vector";
import {
  AlifeSimulator,
  AnyGameObject,
  LuaArray,
  Optional,
  Patrol,
  ServerObject,
  ServerPhysicObject,
  TCount,
  TDistance,
  TIndex,
  TLabel,
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
 * @param itemSection - section of item
 * @param count - count of items to spawn
 * @param probability - probability to spawn item, 100% by default
 * @returns count of spawned items
 */
export function spawnItemsForObject(
  object: AnyGameObject,
  itemSection: TSection,
  count: TCount = 1,
  probability: TProbability = 100
): TCount {
  if (count < 1 || probability < 0) {
    return 0;
  } else if (isAmmoSection(itemSection)) {
    return spawnAmmoForObject(object, itemSection, count, probability);
  }

  let itemsSpawned: TCount = 0;

  const simulator: AlifeSimulator = registry.simulator;
  const [id, gvid, lvid, position] = getObjectPositioning(object);

  for (const it of $range(1, count)) {
    if (math.random(100) <= probability) {
      simulator.create(itemSection, position, lvid, gvid, id);
      itemsSpawned += 1;
    }
  }

  return itemsSpawned;
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
  if (count < 1 || probability < 0) {
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

  for (const it of $range(1, count)) {
    spawnItemsForObject(object, itemSections.get(math.random(itemSections.length())), 1);
  }
}

/**
 * Get matching translation for section if it exists.
 *
 * @param section - section name to check for translated name
 * @returns translated item name if translation is declared
 */
export function getInventoryNameForItemSection(section: TSection): TLabel {
  if (SYSTEM_INI.section_exist(section) && SYSTEM_INI.line_exist(section, "inv_name")) {
    const caption: Optional<TLabel> = SYSTEM_INI.r_string(section, "inv_name");

    return game.translate_string(caption || section);
  } else {
    return game.translate_string(section);
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

  const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
  const smartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainByName(smartTerrainName);

  assert(smartTerrain, "Wrong smartName '%s' for faction in spawnSquad function", tostring(smartTerrainName));

  const squad: Squad = simulationBoardManager.createSquad(smartTerrain, section);

  simulationBoardManager.enterSmartTerrain(squad, smartTerrain.id);

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
  logger.info("Spawn object:", section, pathName);

  assertDefined(section, "Wrong spawn section for 'spawnObject' function '%s'.", section);
  assertDefined(pathName, "Wrong spawn pathName for 'spawnObject' function '%s'.", pathName);
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
  // logger.info("Spawn in object:", section, targetId);

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
  const simulator: AlifeSimulator = registry.simulator;
  const serverObject: Optional<ServerObject> = simulator.object(objectId);

  logger.info("Destroying object:", objectId);

  if (serverObject === null) {
    logger.warn("No existing object to destroy:", objectId);
  } else {
    simulator.release(serverObject, true);
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
  const simulator: AlifeSimulator = registry.simulator;
  const direction: Vector = registry.actor.direction();
  const position: Vector = registry.actor.position().add(direction.mul(distance));

  return simulator.create(section, position, registry.actor.level_vertex_id(), registry.actor.game_vertex_id());
}
