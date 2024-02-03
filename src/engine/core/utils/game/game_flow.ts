import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { consoleCommands } from "@/engine/lib/constants/console_commands";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Disconnect from current game.
 * Shows main menu and ends current game progress.
 */
export function disconnectFromGame(): void {
  logger.info("Game disconnect");
  executeConsoleCommand(consoleCommands.disconnect);
}
