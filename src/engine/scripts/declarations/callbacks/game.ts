import { SaveManager } from "@/engine/core/managers/base/SaveManager";
import { TradeManager } from "@/engine/core/managers/interaction/trade/TradeManager";
import { smartCoversList } from "@/engine/core/objects/animation/smart_covers";
import { GameOutroManager } from "@/engine/core/ui/game/GameOutroManager";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind game externals");

/**
 * Declare `main` function to enable custom scripts execution.
 * In case if custom script is executed from console and has no `main` function, this placeholder will be used.
 */
extern("main", () => {});

/**
 * Declare list of available smart covers for game engine.
 * Xray uses it internally.
 */
extern("smart_covers", {
  descriptions: smartCoversList,
});

/**
 * Module of callbacks related to game outro.
 */
extern("outro", {
  conditions: GameOutroManager.OUTRO_CONDITIONS,
  start_bk_sound: () => GameOutroManager.getInstance().startBkSound(),
  stop_bk_sound: () => GameOutroManager.getInstance().stopBkSound(),
  update_bk_sound_fade_start: (factor: number) => GameOutroManager.getInstance().updateBkSoundFadeStart(factor),
  update_bk_sound_fade_stop: (factor: number) => GameOutroManager.getInstance().updateBkSoundFadeStop(factor),
});

/**
 * Trading callbacks module.
 * Adjust pricing / trading from lua.
 */
extern("trade_manager", {
  get_sell_discount: (objectId: TNumberId) => TradeManager.getInstance().getSellDiscountForObject(objectId),
  get_buy_discount: (objectId: TNumberId) => TradeManager.getInstance().getBuyDiscountForObject(objectId),
});

/**
 * Called from game engine just before creating game save.
 */
extern("on_before_game_save", (saveName: TName) => SaveManager.getInstance().onBeforeGameSave(saveName));

/**
 * Called from game engine when game save is created.
 */
extern("on_game_save", (saveName: TName) => SaveManager.getInstance().onGameSave(saveName));

/**
 * Called from game engine just before loading game save.
 */
extern("on_before_game_load", (saveName: TName) => SaveManager.getInstance().onBeforeGameLoad(saveName));

/**
 * Called from game engine after loading game save.
 */
extern("on_game_load", (saveName: TName) => SaveManager.getInstance().onGameLoad(saveName));
