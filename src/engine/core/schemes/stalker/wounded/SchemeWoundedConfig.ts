import { ini_file } from "xray16";
import { IniFile } from "xray16/alias";

import { readIniNumber } from "@/engine/core/ini";

export const WOUNDED_SCHEME_CONFIG_LTX: IniFile = new ini_file("schemes\\wounded.ltx");

/**
 * Configuration of the scheme.
 */
export const schemeWoundedConfig = {
  CALL_FOR_HELP_DELAY: readIniNumber(WOUNDED_SCHEME_CONFIG_LTX, "config", "call_for_help_delay", false, 5_000),
  CALL_FOR_HELP_PERIOD: readIniNumber(WOUNDED_SCHEME_CONFIG_LTX, "config", "call_for_help_period", false, 5_000),
  WOUNDED_TIMEOUT: readIniNumber(WOUNDED_SCHEME_CONFIG_LTX, "config", "wounded_timeout", false, 60_000),
};
