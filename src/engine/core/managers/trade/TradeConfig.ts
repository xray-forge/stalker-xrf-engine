import { ini_file } from "xray16";

import { readIniNumber } from "@/engine/core/utils/ini";
import { IniFile } from "@/engine/lib/types";

export const TRADE_MANAGER_LTX: IniFile = new ini_file("managers\\trade_manager.ltx");

export const tradeConfig = {
  DEFAULT_TRADE_LTX_PATH: "misc\\trade\\trade_generic.ltx",
  UPDATE_PERIOD: readIniNumber(TRADE_MANAGER_LTX, "config", "update_period", true),
  RESUPPLY_PERIOD: readIniNumber(TRADE_MANAGER_LTX, "config", "resupply_period", true),
};
