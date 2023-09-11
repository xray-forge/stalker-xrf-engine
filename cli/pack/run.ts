import { Command, Option } from "commander";

import { pack } from "#/pack/pack";

/**
 * Setup parsing commands.
 */
export function setupPackCommands(command: Command): void {
  command
    .command("pack <type>")
    .description("create custom game build package")
    .addOption(new Option("--nb, --no-build", "do not run build before creation").default(true))
    .addOption(new Option("--nc, --no-compress", "do not run compression").default(true))
    .addOption(new Option("--na, --no-asset-overrides", "skip step with building additional assets"))
    .addOption(new Option("-e, --engine <type>", "use provided engine"))
    .addOption(new Option("--se, --skip-engine", "do not include engine in build"))
    .addOption(new Option("-o, --optimize", "use build optimizations"))
    .addOption(new Option("-v, --verbose", "use verbose logging"))
    .addOption(new Option("-c, --clean", "perform destination clean"))
    .action(pack);
}
