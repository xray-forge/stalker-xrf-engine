import { game } from "xray16";
import { LuaArray, Nillable, TCount, TLabel, TName, TRate, TSection } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { registry, SYSTEM_INI } from "@/engine/core/database";
import { ITEM_UPGRADES } from "@/engine/core/managers/upgrades/UpgradesConfig";
import { getRepairPrice, getUpgradeCost } from "@/engine/core/managers/upgrades/utils/upgrades_price_utils";
import { parseStringsList, readIniBoolean } from "@/engine/core/utils/ini";
import { CURRENCY_LABEL } from "@/engine/lib/constants/currency";

/**
 * @param section - Item section to get upgrade cost.
 * @returns Upgrade cost label for provided item section.
 */
export function getUpgradeCostLabel(section: TSection): TLabel {
  return $isNil(registry.actor) ? " " : `${game.translate_string("st_upgr_cost")}: ${getUpgradeCost(section)}`;
}

/**
 * @param section - Item section to get replic label for.
 * @param condition - Item condition.
 * @param canRepair - Whether item can be repaired.
 * @param mechanicName - Name of the mechanic.
 * @returns Label with confirmation or warning about item repair process.
 */
export function getRepairItemAskReplicLabel(
  section: TSection,
  condition: TRate,
  canRepair: boolean,
  mechanicName: TName
): TLabel {
  // Item defined as no repairable.
  if (readIniBoolean(SYSTEM_INI, section, "no_repair", false, false)) {
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
      CURRENCY_LABEL,
      game.translate_string("ui_inv_not_enought_money"),
      price - registry.actor.money(),
      CURRENCY_LABEL
    );
  }

  // Price N $. Repair?
  return string.format(
    "%s %s %s. %s?",
    game.translate_string("st_upgr_cost"),
    price,
    CURRENCY_LABEL,
    game.translate_string("ui_inv_repair")
  );
}

/**
 * @param data - Comma separated list of upgrades to add (?).
 * @param upgrade - Name of upgrade.
 * @returns Issued property label.
 */
export function issueUpgradeProperty(data: string, upgrade: TName): TLabel {
  const propertyName: TLabel = game.translate_string(ITEM_UPGRADES.r_string(upgrade, "name"));
  const values: LuaArray<string> = parseStringsList(data);
  const section: Nillable<TSection> = values.get(1);

  if (section && ITEM_UPGRADES.line_exist(section, "value") && ITEM_UPGRADES.r_string(section, "value")) {
    return string.format("%s %s", propertyName, string.sub(ITEM_UPGRADES.r_string(section, "value"), 2, -2));
  }

  return propertyName;
}
