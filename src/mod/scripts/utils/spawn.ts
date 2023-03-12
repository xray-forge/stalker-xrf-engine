import { alife, system_ini, XR_game_object, XR_ini_file } from "xray16";

import { TInventoryItem } from "@/mod/globals/items";
import { TAmmoItem } from "@/mod/globals/items/ammo";
import { LuaArray, Optional, TCount, TProbability, TSection } from "@/mod/lib/types";
import { AnyGameObject } from "@/mod/lib/types/engine";
import { IRegistryObjectState } from "@/mod/scripts/core/database";
import { getObjectPositioning } from "@/mod/scripts/utils/alife";
import { isAmmoSection } from "@/mod/scripts/utils/checkers/is";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo: description
 */
export function spawnItemsForObject(
  object: AnyGameObject,
  itemSection: TInventoryItem,
  count: TCount = 1,
  probability: TProbability = 100
): void {
  if (count < 1 || probability < 0) {
    return;
  } else if (isAmmoSection(itemSection)) {
    return spawnAmmoForObject(object, itemSection, count, probability);
  }

  const [id, gvid, lvid, position] = getObjectPositioning(object);

  for (const it of $range(1, count)) {
    if (math.random(100) <= probability) {
      alife().create(itemSection, position, lvid, gvid, id);
    }
  }
}

/**
 * todo;
 */
export function spawnAmmoForObject(
  object: AnyGameObject,
  ammoSection: TAmmoItem,
  count: TCount,
  probability: TProbability = 1
): void {
  if (count < 1 || probability < 0) {
    return;
  }

  const [id, gvid, lvid, position] = getObjectPositioning(object);
  const ini: XR_ini_file = system_ini();
  const countInBox: TCount = ini.r_u32(ammoSection, "box_size");

  /**
   * Game engine limits ammo to spawn in boxes.
   * Everything in one transaction bigger than `box_size` will cause an exception.
   */
  if (math.random(100) <= probability) {
    while (count > countInBox) {
      alife().create_ammo(ammoSection, position, lvid, gvid, id, countInBox);

      count = count - countInBox;
    }

    alife().create_ammo(ammoSection, position, lvid, gvid, id, count);
  }
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
  const spawnItemsSection: Optional<TSection> = getConfigString(
    state.ini,
    state.section_logic,
    "spawn",
    object,
    false,
    "",
    null
  );

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
