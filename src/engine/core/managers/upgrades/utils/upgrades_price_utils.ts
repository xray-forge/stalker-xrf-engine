import { TCount, TName, TRate, TSection } from "xray16/lib";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { readIniBoolean } from "@/engine/core/ini";
import { ITEM_UPGRADES, upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import { getItemPrice } from "@/engine/core/utils/item";

/**
 * @param section - Item section.
 * @param condition - Item condition rate.
 * @param mechanicName - Name of mechanic to repair with.
 * @returns Whether item can be repaired.
 */
export function canRepairItem(section: TSection, condition: TRate, mechanicName: TName): boolean {
  // Item defined as no repairable.
  if (readIniBoolean(SYSTEM_INI, section, "no_repair", false, false)) {
    return false;
  }

  return registry.actor.money() >= getRepairPrice(section, condition);
}

/**
 * @param section - Section of the item to get price for.
 * @param condition - Current condition state of the item object.
 * @returns Repair price based on item price and condition.
 */
export function getRepairPrice(section: TSection, condition: TRate): TCount {
  return math.floor(
    getItemPrice(section) *
      (1 - condition) *
      upgradesConfig.ITEM_REPAIR_PRICE_COEFFICIENT *
      upgradesConfig.PRICE_DISCOUNT_RATE
  );
}

/**
 * @param section - Item section to get upgrade cost.
 * @returns Upgrade cost label for provided item section.
 */
export function getUpgradeCost(section: TSection): TCount {
  return math.floor(ITEM_UPGRADES.r_u32(section, "cost") * upgradesConfig.PRICE_DISCOUNT_RATE);
}
