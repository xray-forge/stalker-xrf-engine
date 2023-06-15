import { Command, Option } from "commander";

import { formatLtx } from "#/format/format_ltx";

/**
 * Setup start commands.
 */
export function setupFormatCommands(command: Command): void {
  const formatCommand: Command = command.command("format").description("custom formatting commands");

  formatCommand
    .command("ltx")
    .description("format ltx files")
    .addOption(new Option("-f, --filter <targets...>", "filter files with regex").default([]))
    .action(formatLtx);
}
