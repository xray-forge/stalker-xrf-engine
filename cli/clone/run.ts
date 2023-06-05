import { Argument, Command, Option } from "commander";

import { cloneRepository } from "#/clone/clone_repository";

/**
 * Setup clone commands.
 */
export function setupCloneCommands(command: Command): void {
  command
    .command("clone")
    .description("command to clone additional resources repositories")
    .addArgument(new Argument("<repository>", "repository to clone").default(null).argOptional())
    .addOption(new Option("-l, --list", "print list of possible options"))
    .addOption(new Option("-v, --verbose", "verbose logging"))
    .addOption(new Option("-f, --force", "force repository overwrite"))
    .action(cloneRepository);
}
