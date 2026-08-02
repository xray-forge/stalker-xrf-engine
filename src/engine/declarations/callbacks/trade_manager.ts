import { extern, TNumberId } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { TradeManager } from "@/engine/core/managers/trade";

/** Trading callbacks. */
extern("trade_manager", {
  get_sell_discount: (objectId: TNumberId) => getManager(TradeManager).getSellDiscountForObject(objectId),
  get_buy_discount: (objectId: TNumberId) => getManager(TradeManager).getBuyDiscountForObject(objectId),
});
