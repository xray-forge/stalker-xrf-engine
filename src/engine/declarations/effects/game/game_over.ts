import { executeConsoleCommand, extern } from "xray16/lib";
import { $filename } from "xray16/macros";

import { consoleCommands } from "@/engine/constants/console_commands";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameState } from "@/engine/declarations/effects/game/shared";

const logger: LuaLogger = new LuaLogger($filename);

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
