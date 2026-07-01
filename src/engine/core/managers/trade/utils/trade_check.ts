import { IRegistryObjectState, registry } from "@/engine/core/database";
import { tradeConfig } from "@/engine/core/managers/trade/TradeConfig";
import { readObjectTradeIniPath } from "@/engine/core/managers/trade/utils/trade_init";
import { Nillable, TNumberId } from "@/engine/lib/types";

/**
 * @param id - Target object id to check.
 * @returns If object is considered trader (trading config is non-default).
 */
export function isObjectTrader(id: TNumberId): boolean {
  const state: Nillable<IRegistryObjectState> = registry.objects.get(id);

  return state && state.sectionLogic
    ? readObjectTradeIniPath(state.ini, state.sectionLogic) !== tradeConfig.DEFAULT_TRADE_LTX_PATH
    : false;
}
