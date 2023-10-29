import { game } from "xray16";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { ITEM_UPGRADES, upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import { getItemPrice } from "@/engine/core/utils/item";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { TCount, TLabel, TName, TRate, TSection } from "@/engine/lib/types";

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

/**
 * @param section - item section to get upgrade cost
 * @returns upgrade cost label for provided item section
 */
export function getUpgradeCostLabel(section: TSection): TLabel {
  return registry.actor === null ? " " : `${game.translate_string("st_upgr_cost")}: ${getUpgradeCost(section)}`;
}

/**
 * @param section - item section to get replic label for
 * @param condition - item condition
 * @param canRepair - whether item can be repaired
 * @param mechanicName - name of the mechanic
 * @returns label with confirmation or warning about item repair process
 */
export function getRepairItemAskReplicLabel(
  section: TSection,
  condition: TRate,
  canRepair: boolean,
  mechanicName: TName
): TLabel {
  // Item defined as no repairable.
  if (SYSTEM_INI.r_bool(section, "no_repair")) {
    return game.translate_string("st_gauss_cannot_be_repaired");
  }

  const price: TCount = getRepairPrice(section, condition);

  if (registry.actor.money() < price) {
    // Price is: N $\n
    // Not enough money: N $
    return string.format(
      "%s: %s %s\\n%s: %s %s",
      game.translate_string("st_upgr_cost"),
      price,
      gameConfig.CURRENCY,
      game.translate_string("ui_inv_not_enought_money"),
      price - registry.actor.money(),
      gameConfig.CURRENCY
    );
  }

  // Price N $. Repair?
  return string.format(
    "%s %s %s. %s?",
    game.translate_string("st_upgr_cost"),
    price,
    gameConfig.CURRENCY,
    game.translate_string("ui_inv_repair")
  );
}
