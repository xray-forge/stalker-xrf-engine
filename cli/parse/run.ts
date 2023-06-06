import { Command } from "commander";

import { parseDirAsJson } from "#/parse/parse_dir_as_json";
import { parseExternals } from "#/parse/parse_externals";
import { parseTranslationAsJson } from "#/parse/parse_translation_as_json";

/**
 * Setup parsing commands.
 */
export function setupParseCommands(command: Command): void {
  const engineCommand: Command = command.command("parse").description("parsing of directories");

  engineCommand
    .command("dir_as_json <path>")
    .description("parse provided path tree to json")
    .option("-e, --no-extension", "skip extension in resulting json names")
    .action(parseDirAsJson);

  engineCommand
    .command("translation_as_json <path>")
    .description("parse provided path to xml translation as json")
    .option("-l, --language <locale>", "use language as key for translations")
    .option("-v, --verbose", "use verbose logging")
    .action(parseTranslationAsJson);

  engineCommand
    .command("externals")
    .description("parse game engine declared externals for usage in configs")
    .action(parseExternals);
}
