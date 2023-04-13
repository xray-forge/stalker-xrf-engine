import { Command } from "commander";

import { openGameFolder } from "#/open/open_game_folder";
import { openProjectFolder } from "#/open/open_project_folder";

/**
 * Setup logs management command.
 */
export function setupOpenCommands(command: Command): void {
  command.command("open_game_folder").description("open configured game folder").action(openGameFolder);
  command.command("open_project_folder").description("open project folder").action(openProjectFolder);
}
