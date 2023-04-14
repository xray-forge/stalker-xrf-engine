import { Argument, Command } from "commander";

import { printLastLogLines } from "#/logs/logs_lines";

/**
 * Setup logs management command.
 */
export function setupLogsCommands(command: Command): void {
  command
    .command("logs")
    .description("print last [N] lines of linked engine logs file")
    .addArgument(new Argument("<lines>", "count of lines to print").default(15).argOptional().argParser(parseInt))
    .action(printLastLogLines);
}
