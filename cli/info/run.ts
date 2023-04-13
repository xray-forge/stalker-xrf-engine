import { Command } from "commander";

import { printInfo } from "#/info/info";

/**
 * Setup info command.
 */
export function setupInfoCommands(command: Command): void {
  command.command("info").description("print project information").action(printInfo);
}
