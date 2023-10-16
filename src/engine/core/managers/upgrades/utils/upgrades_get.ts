import { TUpgradesList } from "@/engine/core/managers/upgrades/item_upgrades_types";
import { upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import { parseStringsList, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { IniFile, LuaArray, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
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
 * todo;
 * todo;
 * todo;
 *
 * @param ini
 * @param section
 */
export function readAllObjectUpgrades(ini: IniFile, section: TSection): TUpgradesList {
  if (upgradesConfig.UPGRADES_CACHE.has(section)) {
    return upgradesConfig.UPGRADES_CACHE.get(section);
  }

  const upgrades: Optional<string> = readIniString(ini, section, "upgrades", false);
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
