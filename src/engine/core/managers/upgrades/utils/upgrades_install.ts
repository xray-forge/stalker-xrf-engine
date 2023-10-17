import { SYSTEM_INI } from "@/engine/core/database";
import { IUpgradeDescriptor, TUpgradesList } from "@/engine/core/managers/upgrades/item_upgrades_types";
import { readAllObjectUpgrades } from "@/engine/core/managers/upgrades/utils/upgrades_get";
import { getItemInstalledUpgradesSet } from "@/engine/core/utils/item";
import { LuaLogger } from "@/engine/core/utils/logging";
import { GameObject, LuaArray, TCount, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Add single random update for item object.
 *
 * @param object - target item object to add upgrades for
 * @returns whether upgrade was installed
 */
export function addRandomUpgrade(object: GameObject): boolean {
  const installed: LuaTable<TSection, boolean> = getItemInstalledUpgradesSet(object);
  const upgrades: TUpgradesList = readAllObjectUpgrades(SYSTEM_INI, object.section());

  if (table.size(installed) > 0) {
    const available: LuaArray<IUpgradeDescriptor> = new LuaTable();

    for (const [, descriptor] of upgrades) {
      if (!installed.has(descriptor.id)) {
        table.insert(available, descriptor);
      }
    }

    // Try to install if any available exists.
    return table.size(available) > 0 ? object.add_upgrade(table.random(available)[1].id) : false;
  } else if (table.size(upgrades) > 0) {
    return object.add_upgrade(table.random(upgrades)[1].id);
  }

  return false;
}

/**
 * Install random upgrades for item object.
 *
 * @param object - target item object to add upgrades for
 * @param count - count of upgrades to install
 */
export function addRandomUpgrades(object: GameObject, count: TCount): void {
  const available: LuaTable<IUpgradeDescriptor, boolean> = new LuaTable();
  const installed: LuaTable<TSection, boolean> = getItemInstalledUpgradesSet(object);
  const upgrades: TUpgradesList = readAllObjectUpgrades(SYSTEM_INI, object.section());

  for (const [, descriptor] of upgrades) {
    if (!installed.has(descriptor.id)) {
      available.set(descriptor, true);
    }
  }

  count = math.min(count, table.size(available));

  while (count > 0) {
    const [descriptor] = table.random(available);

    object.add_upgrade(descriptor.id);
    available.delete(descriptor);

    count--;
  }
}
