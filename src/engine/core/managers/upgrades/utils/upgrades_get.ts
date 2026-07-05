import { IniFile } from "xray16/alias";
import { LuaArray, Nillable, TSection } from "xray16/lib";

import { TUpgradesList } from "@/engine/core/managers/upgrades/item_upgrades_types";
import { upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import { parseStringsList, readIniString } from "@/engine/core/utils/ini";

/**
 * Read upgrade group information from ini file / specific upgrade group section.
 * Used for recursive navigation over upgrades group, contains side effect - modifies destination collection.
 *
 * @param ini - Target ini file to read upgrades from.
 * @param section - Section of upgrade group to read data for.
 * @param destination - Target upgrades list to read data inti.
 */
export function readUpgradeGroup(ini: IniFile, section: TSection, destination: TUpgradesList): void {
  if (!ini.section_exist(section)) {
    return;
  }

  const elements: LuaArray<TSection> = parseStringsList(readIniString(ini, section, "elements", false) ?? "");

  for (const [, id] of elements) {
    table.insert(destination, { id: id, groupId: section });

    const effects: LuaArray<TSection> = parseStringsList(readIniString(ini, id, "effects", false) ?? "");

    for (const [, effect] of effects) {
      readUpgradeGroup(ini, effect, destination);
    }
  }
}

/**
 * Get list of upgrades descriptors for weapon section.
 *
 * @param ini - Target ini file to read upgrades from.
 * @param section - Item section to read upgrades for.
 * @returns Item upgrades data from ini or from cache.
 */
export function readAllObjectUpgrades(ini: IniFile, section: TSection): TUpgradesList {
  if (upgradesConfig.UPGRADES_CACHE.has(section)) {
    return upgradesConfig.UPGRADES_CACHE.get(section);
  }

  const upgrades: Nillable<string> = readIniString(ini, section, "upgrades", false);
  const list: TUpgradesList = new LuaTable();

  if (upgrades) {
    const possibleUpgrades: LuaArray<TSection> = parseStringsList(upgrades);

    for (const [, group] of possibleUpgrades) {
      readUpgradeGroup(ini, group, list);
    }
  }

  upgradesConfig.UPGRADES_CACHE.set(section, list);

  return list;
}
