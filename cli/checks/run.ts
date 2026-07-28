import { Command, Option } from "commander";

import { buildChecks } from "#/checks/build_checks";
import { cleanChecks } from "#/checks/clean_checks";
import { listChecks } from "#/checks/list_checks";

/**
 * Setup checks commands.
 *
 * Flows are in-game verification scripts kept out of the regular build. They are transpiled and deployed
 * only on demand, and walked from the game console.
 */
export function setupChecksCommands(command: Command): void {
  const checksCommand: Command = command.command("checks").description("on demand in-game verification flows");

  checksCommand
    .command("build")
    .description("transpile flows into gamedata and emit console launchers")
    .addOption(new Option("-v, --verbose", "print verbose logs").default(false))
    .action(buildChecks);

  checksCommand
    .command("clean")
    .description("remove flow scripts and launchers from gamedata")
    .addOption(new Option("-v, --verbose", "print verbose logs").default(false))
    .action(cleanChecks);

  checksCommand
    .command("list")
    .description("print available flows and the console command for each")
    .action(listChecks);
}
