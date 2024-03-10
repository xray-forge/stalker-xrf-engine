import { Command, Option } from "commander";

import { formatLtx } from "#/format/format_ltx";

/**
 * Setup format commands.
 */
export function setupFormatCommands(command: Command): void {
  const formatCommand: Command = command.command("format").description("custom formatting commands");

  formatCommand
    .command("ltx")
    .description("format ltx files")
    .addOption(new Option("-c, --check", "Run ltx formatter in check mode").default(false))
    .addOption(new Option("-v, --verbose", "Whether verbose logging mode is enabled").default(false))
    .action(formatLtx);
}
