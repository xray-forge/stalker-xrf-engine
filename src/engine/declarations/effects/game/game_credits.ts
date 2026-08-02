import { game } from "xray16";
import { extern } from "xray16/lib";

import { gameState, logger } from "./shared";

/**
 * Show game credits tutorial scene.
 */
extern("xr_effects.game_credits", (): void => {
  logger.info("Game credits");

  gameState.isGameoverCreditsStarted = true;
  game.start_tutorial("credits_seq");
});
