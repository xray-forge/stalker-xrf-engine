import { Command, Option } from "commander";

import { build, EBuildTarget } from "#/build/build";

/**
 * Setup build command.
 */
export function setupBuildCommands(command: Command): void {
  command
    .command("build")
    .description("build template sources")
    .addOption(
      new Option("-i, --include <targets...>", "include build targets")
        .choices(Object.values(EBuildTarget))
        .default("all", "include all targets")
    )
    .addOption(
      new Option("-e, --exclude <targets...>", "exclude build target")
        .choices(Object.values(EBuildTarget))
        .conflicts("include")
    )
    .addOption(new Option("-v, --verbose", "print verbose build logs"))
    .addOption(new Option("-f, --filter <targets...>", "filter files with regex filter"))
    .addOption(new Option("-c, --clean", "perform target clean before build"))
    .addOption(new Option("--nl, --no-lua-logs", "strip all lua logs from target build"))
    .addOption(new Option("--na, --no-asset-overrides", "skip step with building additional assets"))
    .action(build);
}
