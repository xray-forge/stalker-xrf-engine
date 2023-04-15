import { alife, game, system_ini, XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState, SYSTEM_INI } from "@/engine/core/database";
import { isAmmoSection } from "@/engine/core/utils/check/is";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectPositioning } from "@/engine/core/utils/object";
import { TCaption } from "@/engine/lib/constants/captions";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { TAmmoItem } from "@/engine/lib/constants/items/ammo";
import { LuaArray, Optional, TCount, TLabel, TProbability, TSection } from "@/engine/lib/types";
import { AnyGameObject } from "@/engine/lib/types/engine";

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
  itemSection: TInventoryItem,
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
  const ini: XR_ini_file = system_ini();
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
export function spawnDefaultObjectItems(object: XR_game_object, state: IRegistryObjectState): void {
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
