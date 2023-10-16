import { tradeConfig } from "@/engine/core/managers/trade/TradeConfig";
import { readIniString } from "@/engine/core/utils/ini";
import { IniFile, TPath, TSection } from "@/engine/lib/types";

/**
 * todo;
 */
export function readObjectTradeIniPath(ini: IniFile, section: TSection): TPath {
  return readIniString(ini, section, "trade", false, null, tradeConfig.DEFAULT_TRADE_LTX_PATH);
}
