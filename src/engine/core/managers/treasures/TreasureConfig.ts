import { ini_file } from "xray16";

import { readIniTreasuresList } from "@/engine/core/managers/treasures/utils/treasures_init";
import { readIniBoolean, readIniNumber } from "@/engine/core/utils/ini";
import { IniFile } from "@/engine/lib/types";

export const TREASURE_MANAGER_CONFIG_LTX: IniFile = new ini_file("managers\\treasure_manager.ltx");

export const treasureConfig = {
  ENHANCED_MODE_ENABLED: readIniBoolean(TREASURE_MANAGER_CONFIG_LTX, "config", "enhanced_mode_enabled", true),
  UPDATED_PERIOD: readIniNumber(TREASURE_MANAGER_CONFIG_LTX, "config", "update_period", false, 500),
  TREASURES: readIniTreasuresList(TREASURE_MANAGER_CONFIG_LTX),
};
