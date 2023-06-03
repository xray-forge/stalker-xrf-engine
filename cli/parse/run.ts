import { Command } from "commander";

import { parseDirAsJson } from "#/parse/parse_dir_as_json";
import { parseExternals } from "#/parse/parse_externals";

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
    .command("externals")
    .description("parse game engine declared externals for usage in configs")
    .action(parseExternals);
}
