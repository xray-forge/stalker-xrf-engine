import { Command } from "commander";

import { parseTranslationAsJson } from "#/translations/parse_translation_as_json";

/**
 * Setup translations commands.
 */
export function setupTranslationsCommands(command: Command): void {
  const engineCommand: Command = command.command("translations").description("translations utils");

  engineCommand
    .command("to_json <path>")
    .description("parse provided xml translation file or folder path as json")
    .option("-l, --language <locale>", "use language as key for translations")
    .option("-c, --clean", "whether output should be cleaned up")
    .option("-o, --output <path>", "output file or directory")
    .option("-e, --encoding <encoding>", "use specified target XML encoding")
    .option("-v, --verbose", "use verbose logging")
    .action(parseTranslationAsJson);
}
