import { SYSTEM_INI } from "@/engine/core/database";
import { TUpgradesList } from "@/engine/core/managers/upgrades/item_upgrades_types";
import { parseStringsList, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { LuaArray, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function readUpgradeGroup(section: TSection, to: TUpgradesList): void {
  if (!SYSTEM_INI.section_exist(section)) {
    return;
  }

  const elements: LuaArray<TSection> = parseStringsList(
    readIniString(SYSTEM_INI, section, "elements", false, null, "")
  );

  for (const [, id] of elements) {
    table.insert(to, { id: id, groupId: section });

    const effects: LuaArray<TSection> = parseStringsList(readIniString(SYSTEM_INI, id, "effects", false) ?? "");

    for (const [, effect] of effects) {
      readUpgradeGroup(effect, to);
    }
  }
}

/**
 * todo;
 * todo;
 * todo;
 *
 * @param section
 */
export function readAllObjectUpgrades(section: TSection): TUpgradesList {
  const upgrades: Optional<string> = readIniString(SYSTEM_INI, section, "upgrades", false, null, null);
  const list: TUpgradesList = new LuaTable();

  if (upgrades) {
    const possibleUpgrades: LuaArray<TSection> = parseStringsList(upgrades);

    for (const [, group] of possibleUpgrades) {
      readUpgradeGroup(group, list);
    }
  }

  return list;
}
