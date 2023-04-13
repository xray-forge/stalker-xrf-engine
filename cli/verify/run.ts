import { Command } from "commander";

import { verify } from "#/verify/verify";

/**
 * Setup verify commands.
 */
export function setupVerifyCommands(command: Command): void {
  command.command("verify").description("verify whether project is configured and set up correctly").action(verify);
}
