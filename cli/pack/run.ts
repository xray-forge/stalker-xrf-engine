import { Command, Option } from "commander";

import { pack } from "#/pack/pack";

/**
 * Setup parsing commands.
 */
export function setupPackCommands(command: Command): void {
  command
    .command("pack")
    .description("create custom game build package")
    .addOption(new Option("-b, --build", "run build before creation"))
    .addOption(new Option("-e, --engine <type>", "use provided engine"))
    .addOption(new Option("-o, --optimize", "use build optimizations"))
    .addOption(new Option("-v, --verbose", "use verbose logging"))
    .addOption(new Option("-c, --clean", "perform destination clean"))
    .action(pack);
}
