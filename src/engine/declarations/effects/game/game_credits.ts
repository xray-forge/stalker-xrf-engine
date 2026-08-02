import { game } from "xray16";
import { extern } from "xray16/lib";
import { $filename } from "xray16/macros";

import { LuaLogger } from "@/engine/core/utils/logging";
import { gameState } from "@/engine/declarations/effects/game/shared";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Show game credits tutorial scene.
 */
extern("xr_effects.game_credits", (): void => {
  logger.info("Game credits");

  gameState.isGameoverCreditsStarted = true;
  game.start_tutorial("credits_seq");
});
