import { Command, Option } from "commander";

import { compress } from "#/compress/compress";

/**
 * Setup compression commands.
 */
export function setupCompressCommands(command: Command): void {
  command
    .command("compress")
    .description("compress resulting gamedata and pack into archives")
    .addOption(new Option("-i, --include <targets...>", "include build targets").default("all", "include all targets"))
    .addOption(new Option("-c, --clean", "clean destination directory"))
    .addOption(new Option("-v, --verbose", "verbose logging"))
    .action(compress);
}
