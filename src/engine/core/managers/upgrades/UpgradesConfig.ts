import { ini_file } from "xray16";

import { TUpgradesList } from "@/engine/core/managers/upgrades/item_upgrades_types";
import { readIniBoolean, readIniNumber } from "@/engine/core/utils/ini";
import { IniFile, TSection } from "@/engine/lib/types";

export const UPGRADES_MANAGER_CONFIG_LTX: IniFile = new ini_file("managers\\upgrades_manager.ltx");

export const upgradesConfig = {
  ITEM_REPAIR_PRICE_COEFFICIENT: readIniNumber(
    UPGRADES_MANAGER_CONFIG_LTX,
    "config",
    "item_repair_price_coefficient",
    true
  ),
  UPGRADES_CACHE: new LuaTable<TSection, TUpgradesList>(),
  // Random installation tweaks:
  ADD_RANDOM_UPGRADES: readIniBoolean(UPGRADES_MANAGER_CONFIG_LTX, "random", "add_random_upgrades", true),
  ADD_RANDOM_DISPERSION: readIniNumber(UPGRADES_MANAGER_CONFIG_LTX, "random", "add_random_dispersion", true),
  ADD_RANDOM_RATE: readIniNumber(UPGRADES_MANAGER_CONFIG_LTX, "random", "add_random_rate", true),
  ADD_RANDOM_RATE_TRADER: readIniNumber(UPGRADES_MANAGER_CONFIG_LTX, "random", "add_random_rate_trader", true),
  ADD_RANDOM_CHANCE: readIniNumber(UPGRADES_MANAGER_CONFIG_LTX, "random", "add_random_chance", true),
  ADD_RANDOM_COUNT: readIniNumber(UPGRADES_MANAGER_CONFIG_LTX, "random", "add_random_count", true),
  ADD_RANDOM_RARE_CHANCE: readIniNumber(UPGRADES_MANAGER_CONFIG_LTX, "random", "add_random_rare_chance", true),
  ADD_RANDOM_RARE_COUNT: readIniNumber(UPGRADES_MANAGER_CONFIG_LTX, "random", "add_random_rare_count", true),
  ADD_RANDOM_EPIC_CHANCE: readIniNumber(UPGRADES_MANAGER_CONFIG_LTX, "random", "add_random_epic_chance", true),
  ADD_RANDOM_EPIC_COUNT: readIniNumber(UPGRADES_MANAGER_CONFIG_LTX, "random", "add_random_epic_count", true),
  ADD_RANDOM_LEGENDARY_CHANCE: readIniNumber(
    UPGRADES_MANAGER_CONFIG_LTX,
    "random",
    "add_random_legendary_chance",
    true
  ),
  ADD_RANDOM_LEGENDARY_COUNT: readIniNumber(UPGRADES_MANAGER_CONFIG_LTX, "random", "add_random_legendary_count", true),
};
