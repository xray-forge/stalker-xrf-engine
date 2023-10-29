import { ini_file } from "xray16";

import { TUpgradesList } from "@/engine/core/managers/upgrades/item_upgrades_types";
import { readIniNumber } from "@/engine/core/utils/ini";
import { IniFile, LuaArray, Optional, TLabel, TSection } from "@/engine/lib/types";

export const UPGRADES_MANAGER_CONFIG_LTX: IniFile = new ini_file("managers\\upgrades_manager.ltx");
export const STALKER_UPGRADE_INFO: IniFile = new ini_file("managers\\upgrades\\stalkers_upgrade_info.ltx");
export const ITEM_UPGRADES: IniFile = new ini_file("item_upgrades.ltx");

/**
 * Configuration of item upgrading manager.
 */
export const upgradesConfig = {
  CURRENT_MECHANIC_NAME: "",
  PRICE_DISCOUNT_RATE: 1,
  ITEM_REPAIR_PRICE_COEFFICIENT: readIniNumber(
    UPGRADES_MANAGER_CONFIG_LTX,
    "config",
    "item_repair_price_coefficient",
    true
  ),
  UPGRADES_HINTS: null as Optional<LuaArray<TLabel>>,
  UPGRADES_CACHE: new LuaTable<TSection, TUpgradesList>(),
};
