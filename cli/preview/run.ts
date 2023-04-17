import { Argument, Command } from "commander";

import { generatePreview } from "#/preview/preview";

/**
 * Setup preview commands.
 */
export function setupPreviewCommands(command: Command): void {
  command
    .command("preview")
    .description("generate HTML preview from game XML forms")
    .addArgument(new Argument("<filters...>", "list of file names to match for building").argOptional())
    .option("-c, --clean", "clean target dist before building")
    .option("-v, --verbose", "use verbose logging")
    .action(generatePreview);
}
