import { alife, clsid, game, level, patrol, system_ini } from "xray16";

import { IRegistryObjectState, registry, SYSTEM_INI } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { SmartTerrain, Squad } from "@/engine/core/objects";
import { assertDefined } from "@/engine/core/utils/assertion";
import { isAmmoSection, isStalker } from "@/engine/core/utils/check/is";
import { readIniString } from "@/engine/core/utils/ini/read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectPositioning } from "@/engine/core/utils/object/object_general";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { TCaption } from "@/engine/lib/constants/captions";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { TAmmoItem } from "@/engine/lib/constants/items/ammo";
import {
  AlifeSimulator,
  AnyGameObject,
  ClientObject,
  IniFile,
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

  const [id, gvid, lvid, position] = getObjectPositioning(object);

  for (const it of $range(1, count)) {
    if (math.random(100) <= probability) {
      alife().create(itemSection, position, lvid, gvid, id);
      itemsSpawned += 1;
    }
  }

  return itemsSpawned;
}

/**
 * Spawn ammo objects for provided object.
 *
 * @param object - target object to spawn items for
 * @param ammoSection - section of ammo item
 * @param count - count of ammo to spawn
 * @param probability - probability to spawn item, 100% by default
 * @returns count of spawned ammo
 */
export function spawnAmmoForObject(
  object: AnyGameObject,
  ammoSection: TAmmoItem,
  count: TCount,
  probability: TProbability = 1
): TCount {
  if (count < 1 || probability < 0) {
    return 0;
  }

  const [id, gvid, lvid, position] = getObjectPositioning(object);
  const ini: IniFile = system_ini();
  const countInBox: TCount = ini.r_u32(ammoSection, "box_size");

  let ammoSpawned: TCount = 0;

  /**
   * Game engine limits ammo to spawn in boxes.
   * Everything in one transaction bigger than `box_size` will cause an exception.
   */
  if (math.random(100) <= probability) {
    while (count > countInBox) {
      alife().create_ammo(ammoSection, position, lvid, gvid, id, countInBox);

      count = count - countInBox;
      ammoSpawned += countInBox;
    }

    alife().create_ammo(ammoSection, position, lvid, gvid, id, count);
    ammoSpawned += count;
  }

  return ammoSpawned;
}

/**
 * todo: description
 */
export function spawnItemsForObjectFromList(
  object: AnyGameObject,
  itemSections: LuaArray<TInventoryItem>,
  count: TCount = 1
): void {
  if (count < 1) {
    return;
  }

  for (const it of $range(1, count)) {
    const section: TInventoryItem = itemSections.get(math.random(itemSections.length()));

    if (isAmmoSection(section)) {
      spawnAmmoForObject(object, section, 1);
    } else {
      spawnItemsForObject(object, section, 1);
    }
  }
}

/**
 * todo: description
 */
export function spawnDefaultObjectItems(object: ClientObject, state: IRegistryObjectState): void {
  logger.info("Spawn default items for object:", object.name());

  const itemsToSpawn: LuaTable<TInventoryItem, TCount> = new LuaTable();
  const spawnItemsSection: Optional<TSection> = readIniString(state.ini, state.section_logic, "spawn", false, "", null);

  if (spawnItemsSection === null) {
    return;
  }

  const itemSectionsCount: TCount = state.ini.line_count(spawnItemsSection);

  for (const it of $range(0, itemSectionsCount - 1)) {
    const [result, id, value] = state.ini.r_line(spawnItemsSection, it, "", "");

    itemsToSpawn.set(id as TInventoryItem, value === "" ? 1 : tonumber(value)!);
  }

  for (const [id, count] of itemsToSpawn) {
    if (object.object(id) === null) {
      spawnItemsForObject(object, id, count);
    }
  }
}

/**
 * Get matching translation for section if it exists.
 *
 * @returns translated item name if translation is declared
 */
export function getInventoryNameForItemSection(section: TSection): TLabel {
  if (SYSTEM_INI.section_exist(section) && SYSTEM_INI.line_exist(section, "inv_name")) {
    const caption: Optional<TCaption> = SYSTEM_INI.r_string(section, "inv_name");

    return game.translate_string(caption || section);
  } else {
    return game.translate_string(section);
  }
}

/**
 * Spawn new squad with provided story id in a smart terrain.
 */
export function spawnSquadInSmart(section: Optional<TStringId>, smartTerrainName: Optional<TName>): Squad {
  assertDefined(section, "Wrong squad identifier in spawnSquad function.");
  assertDefined(smartTerrainName, "Wrong squad name in spawnSquad function.");

  assert(
    SYSTEM_INI.section_exist(section),
    "Wrong squad identifier '%s'. Squad doesnt exist in ini.",
    tostring(section)
  );

  const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
  const smartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainByName(smartTerrainName);

  assertDefined(smartTerrain, "Wrong smartName '%s' for faction in spawnSquad function", tostring(smartTerrainName));

  const squad: Squad = simulationBoardManager.createSmartSquad(smartTerrain, section);

  simulationBoardManager.enterSmartTerrain(squad, smartTerrain.id);

  for (const squadMember of squad.squad_members()) {
    simulationBoardManager.setupObjectSquadAndGroup(squadMember.object);
  }

  squad.update();

  return squad;
}

/**
 * Spawn new object.
 */
export function spawnObject<T extends ServerObject>(
  section: Optional<TSection>,
  pathName: Optional<TName>,
  index: TIndex = 0,
  yaw: TRate = 0
): T {
  logger.info("Spawn object");

  assertDefined(section, "Wrong spawn section for 'spawnObject' function '%s'.", tostring(section));
  assertDefined(pathName, "Wrong spawn pathName for 'spawnObject' function '%s'.", tostring(pathName));
  assert(level.patrol_path_exists(pathName), "Path %s doesnt exist. Function 'spawnObject'.", tostring(pathName));

  const objectPatrol: Patrol = new patrol(pathName);

  const serverObject: ServerObject = alife().create(
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
 */
export function spawnObjectInObject<T extends ServerObject>(
  section: Optional<TSection>,
  targetId: Optional<TNumberId>
): T {
  logger.info("Spawn object");

  assertDefined(section, "Wrong spawn section for 'spawnObjectInObject' function '%s'.", tostring(section));
  assertDefined(targetId, "Wrong spawn targetId for 'spawnObjectInObject' function '%s'.", tostring(section));

  const box: Optional<ServerObject> = alife().object(targetId);

  assertDefined(box, "Wrong spawn target object for 'spawnObjectInObject' function '%s'.", tostring(section));

  return alife().create(section, createEmptyVector(), 0, 0, targetId);
}

/**
 * Release object by provided ID.
 * Prints warning if object is not found in registry.
 *
 * @param objectId - object id to release
 */
export function releaseObject(objectId: TNumberId): void {
  const simulator: AlifeSimulator = alife();
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
 */
export function spawnCreatureNearActor<T extends ServerObject>(section: TSection, distance: TDistance): T {
  const simulator: AlifeSimulator = alife();
  const direction: Vector = registry.actor.direction();
  const position: Vector = registry.actor.position().add(direction.mul(distance));

  return simulator.create(section, position, registry.actor.level_vertex_id(), registry.actor.game_vertex_id());
}
