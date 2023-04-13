import { Command } from "commander";

import { startGame } from "#/start/start_game";

/**
 * Setup start commands.
 */
export function setupStartCommands(command: Command): void {
  command.command("start_game").description("start game executable configured in config.json file").action(startGame);
}
