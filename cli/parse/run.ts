import { Command } from "commander";

import { parseDirAsJson } from "#/parse/parse_dir_as_json";

/**
 * Setup parsing commands.
 */
export function setupParseCommands(command: Command): void {
  command
    .command("parse_dir_as_json <path>")
    .description("parse provided path tree to json")
    .option("-e, --no-extension", "skip extension in resulting json names")
    .action(parseDirAsJson);
}
