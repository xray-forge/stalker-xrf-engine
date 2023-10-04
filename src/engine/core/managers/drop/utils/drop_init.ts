import { alife, level } from "xray16";

import type { IItemDropAmountDescriptor } from "@/engine/core/managers/drop/drop_types";
import { abort } from "@/engine/core/utils/assertion";
import { parseNumbersList, parseStringsList } from "@/engine/core/utils/ini";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import type { TInventoryItem } from "@/engine/lib/constants/items";
import type { TLevel } from "@/engine/lib/constants/levels";
import type { IniFile, LuaArray, TCount, TName, TProbability, TSection, TStringId } from "@/engine/lib/types";

/**
 * @param ini - target ini file to read data from
 * @returs map of drop item sections + chance for game communities
 */
export function readIniDropByCommunity(ini: IniFile): LuaTable<TCommunity, LuaTable<TInventoryItem, TProbability>> {
  const itemsByCommunity: LuaTable<TCommunity, LuaTable<TInventoryItem, TProbability>> = new LuaTable();

  // Initialize communities drop.
  for (const [community] of pairs(communities)) {
    const communityDrop: LuaTable<TInventoryItem, TProbability> = new LuaTable();

    if (ini.section_exist(community)) {
      const communityDropItemsCount: TCount = ini.line_count(community);

      for (const it of $range(0, communityDropItemsCount - 1)) {
        const [, field, value] = ini.r_line(community, it, "", "");

        communityDrop.set(field as TInventoryItem, 100 * tonumber(value)!);
      }
    }

    itemsByCommunity.set(community, communityDrop);
  }

  return itemsByCommunity;
}

/**
 * @param ini - target ini file to read data from
 * @returns list of dependencies for each item that should be spawned together
 */
export function readIniDropDependentItems(ini: IniFile): LuaTable<TStringId, LuaTable<TStringId, boolean>> {
  const dependencies: LuaTable<TStringId, LuaTable<TStringId, boolean>> = new LuaTable();

  // Initialize dependent items relation.
  const dependentItemsCount: TCount = ini.line_count("item_dependence");

  for (const it of $range(0, dependentItemsCount - 1)) {
    const [, id, value] = ini.r_line("item_dependence", it, "", "");
    const itemDependencies: LuaTable<TStringId, boolean> = new LuaTable();

    const dependantItems: LuaArray<TStringId> = parseStringsList(value);

    for (const [, section] of dependantItems) {
      itemDependencies.set(section, true);
    }

    dependencies.set(id, itemDependencies);
  }

  return dependencies;
}

/**
 * @param ini - target ini file to read data from
 * @returns list of item count based on level and difficulty
 */
export function readIniDropCountByLevel(ini: IniFile): LuaTable<TStringId, IItemDropAmountDescriptor> {
  if (alife() === null) {
    return new LuaTable();
  }

  const levelName: TName = level.name();

  const itemsLevelDropMultiplayer: LuaTable<TStringId, number> = new LuaTable();
  const itemsDropCountByLevel: LuaTable<TStringId, IItemDropAmountDescriptor> = new LuaTable();

  // Initialize setting and multipliers based on level.
  // Enables level-based controls of current location drops and making some parts of the zone better in terms of drop.
  const currentLevelNameSection: TSection = ini.section_exist(levelName) ? levelName : "default";
  const levelSpecificDropsCount: TCount = ini.line_count(currentLevelNameSection);

  for (const it of $range(0, levelSpecificDropsCount - 1)) {
    const [, id, value] = ini.r_line(currentLevelNameSection, it, "", "");

    itemsLevelDropMultiplayer.set(id as TLevel, tonumber(value)!);
  }

  // Initialize items drop count by selected game difficulty.
  const itemsDropSectionByDifficulty: TSection = "item_count_" + level.get_game_difficulty();
  const itemsDropCountByDifficulty: TCount = ini.line_count(itemsDropSectionByDifficulty);

  for (const it of $range(0, itemsDropCountByDifficulty - 1)) {
    const [, key, value] = ini.r_line(itemsDropSectionByDifficulty, it, "", "");
    const sectionDropCount: LuaArray<TProbability> = parseNumbersList(value);

    if (!sectionDropCount.has(1)) {
      abort(
        "Error in drop manager config declaration, section '%s', line '%s'.",
        itemsDropSectionByDifficulty,
        tostring(key)
      );
    }

    // Do not drop in level if not registered, declare as 0.
    if (!itemsLevelDropMultiplayer.has(key)) {
      itemsLevelDropMultiplayer.set(key, 0);
    }

    const min: TCount = sectionDropCount.get(1);
    const max: TCount = sectionDropCount.has(2) ? sectionDropCount.get(2) : min;

    itemsDropCountByLevel.set(key, {
      min: tonumber(min)! * itemsLevelDropMultiplayer.get(key),
      max: tonumber(max)! * itemsLevelDropMultiplayer.get(key),
    });
  }

  return itemsDropCountByLevel;
}
