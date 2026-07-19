import { IniFile } from "xray16/alias";
import { TPath, TSection } from "xray16/lib";

import { readIniString } from "@/engine/core/ini";
import { tradeConfig } from "@/engine/core/managers/trade/TradeConfig";

/**
 * @param ini - Target file to read data from.
 * @param section - Logics section where trade is configured.
 * @returns Path to object trade configuration based on ini and section.
 */
export function readObjectTradeIniPath(ini: IniFile, section: TSection): TPath {
  return readIniString(ini, section, "trade", false, null, tradeConfig.DEFAULT_TRADE_LTX_PATH);
}
