import { Command, Option } from "commander";

import { compress } from "#/compress/compress";

/**
 * Setup compression commands.
 */
export function setupCompressCommands(command: Command): void {
  command
    .command("compress")
    .description("compress resulting gamedata and pack into archives")
    .addOption(new Option("--verbose", "verbose logging"))
    .action(compress);
}
