import { registry, SYSTEM_INI } from "@/engine/core/database";
import { ITEM_UPGRADES, upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import { getItemPrice } from "@/engine/core/utils/item";
import { TCount, TName, TRate, TSection } from "@/engine/lib/types";

/**
 * @param section - item section
 * @param condition - item condition rate
 * @param mechanicName - name of mechanic to repair with
 * @returns whether item can be repaired
 */
export function canRepairItem(section: TSection, condition: TRate, mechanicName: TName): boolean {
  // Item defined as no repairable.
  if (SYSTEM_INI.r_bool(section, "no_repair")) {
    return false;
  }

  return registry.actor.money() >= getRepairPrice(section, condition);
}

/**
 * @param section - section of the item to get price for
 * @param condition - current condition state of the item object
 * @returns repair price based on item price and condition
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
 * @param section - item section to get upgrade cost
 * @returns upgrade cost label for provided item section
 */
export function getUpgradeCost(section: TSection): TCount {
  return math.floor(ITEM_UPGRADES.r_u32(section, "cost") * upgradesConfig.PRICE_DISCOUNT_RATE);
}
