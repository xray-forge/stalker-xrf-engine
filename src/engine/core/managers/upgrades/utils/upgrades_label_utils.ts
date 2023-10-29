import { game } from "xray16";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { ITEM_UPGRADES } from "@/engine/core/managers/upgrades/UpgradesConfig";
import { getRepairPrice, getUpgradeCost } from "@/engine/core/managers/upgrades/utils/upgrades_price_utils";
import { parseStringsList } from "@/engine/core/utils/ini";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { LuaArray, Optional, TCount, TLabel, TName, TRate, TSection } from "@/engine/lib/types";

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

/**
 * @param data - comma separated list of upgrades to add (?)
 * @param upgrade - name of upgrade
 * @returns issued property label
 */
export function issueUpgradeProperty(data: string, upgrade: TName): TLabel {
  const propertyName: TLabel = game.translate_string(ITEM_UPGRADES.r_string(upgrade, "name"));
  const values: LuaArray<string> = parseStringsList(data);
  const section: Optional<TSection> = values.get(1);

  if (section && ITEM_UPGRADES.line_exist(section, "value") && ITEM_UPGRADES.r_string(section, "value")) {
    return string.format("%s %s", propertyName, string.sub(ITEM_UPGRADES.r_string(section, "value"), 2, -2));
  }

  return propertyName;
}
