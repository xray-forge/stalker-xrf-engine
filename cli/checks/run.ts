import { Command, Option } from "commander";

import { buildChecks } from "#/checks/build_checks";
import { cleanChecks } from "#/checks/clean_checks";
import { listChecks } from "#/checks/list_checks";

/**
 * Setup checks commands.
 *
 * Checks are in-game verification scripts kept out of the regular build. They are transpiled
 * and deployed only on demand, and executed from the game console.
 */
export function setupChecksCommands(command: Command): void {
  const checksCommand: Command = command.command("checks").description("on demand in-game verification checks");

  checksCommand
    .command("build")
    .description("transpile checks into gamedata and emit console launchers")
    .addOption(new Option("-v, --verbose", "print verbose logs").default(false))
    .action(buildChecks);

  checksCommand
    .command("clean")
    .description("remove check scripts and launchers from gamedata")
    .addOption(new Option("-v, --verbose", "print verbose logs").default(false))
    .action(cleanChecks);

  checksCommand
    .command("list")
    .description("print available checks and the console command for each")
    .action(listChecks);
}
