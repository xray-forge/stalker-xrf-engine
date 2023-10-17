import { IRegistryObjectState, registry } from "@/engine/core/database";
import { tradeConfig } from "@/engine/core/managers/trade/TradeConfig";
import { readObjectTradeIniPath } from "@/engine/core/managers/trade/utils/trade_init";
import { Optional, TNumberId } from "@/engine/lib/types";

/**
 * @param id - target object id to check
 * @returns if object is considered trader (trading config is non-default)
 */
export function isObjectTrader(id: TNumberId): boolean {
  const state: Optional<IRegistryObjectState> = registry.objects.get(id);

  return state && state.sectionLogic
    ? readObjectTradeIniPath(state.ini, state.sectionLogic) !== tradeConfig.DEFAULT_TRADE_LTX_PATH
    : false;
}
