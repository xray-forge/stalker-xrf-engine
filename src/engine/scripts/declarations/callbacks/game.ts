/**
 * Outro conditions for game ending based on alife information.
 */
import { TradeManager } from "@/engine/core/managers/interaction/TradeManager";
import { smart_covers_list } from "@/engine/core/objects/alife/smart/smart_covers/smart_covers_list";
import { GameOutroManager } from "@/engine/core/ui/game/GameOutroManager";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind game externals");

// todo: Check if needed.
extern("smart_covers", {
  descriptions: smart_covers_list,
});

/**
 * todo;
 */
extern("outro", {
  conditions: GameOutroManager.OUTRO_CONDITIONS,
  start_bk_sound: () => GameOutroManager.getInstance().start_bk_sound(),
  stop_bk_sound: () => GameOutroManager.getInstance().stop_bk_sound(),
  update_bk_sound_fade_start: (factor: number) => GameOutroManager.getInstance().update_bk_sound_fade_start(factor),
  update_bk_sound_fade_stop: (factor: number) => GameOutroManager.getInstance().update_bk_sound_fade_stop(factor),
});

/**
 * todo;
 */
extern("trade_manager", {
  get_sell_discount: (objectId: TNumberId) => TradeManager.getInstance().getSellDiscountForObject(objectId),
  get_buy_discount: (objectId: TNumberId) => TradeManager.getInstance().getBuyDiscountForObject(objectId),
});
