import { executeConsoleCommand, extern } from "xray16/lib";

import { consoleCommands } from "@/engine/constants/console_commands";

import { gameState, logger } from "./shared";

/**
 * Handle gave over credits.
 */
extern("xr_effects.game_over", (): void => {
  logger.info("Game over, credits sequence ended");

  if (!gameState.isGameoverCreditsStarted) {
    return;
  }

  executeConsoleCommand(consoleCommands.main_menu, "on");
});
