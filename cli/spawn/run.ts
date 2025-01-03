import { Command, Option } from "commander";

import { unpackSpawn } from "#/spawn/unpack_spawn";

/**
 * Setup spawn commands.
 */
export function setupSpawnCommands(command: Command): void {
  const spawnCommand: Command = command.command("spawn").description("alife spawn file commands");

  spawnCommand
    .command("unpack")
    .description("unpack alife spawn file")
    .addOption(new Option("-p, --path <path>", "Source spawn file path to unpack").default(null))
    .addOption(new Option("-d, --dest <dest>", "Output destination to unpack spawn file").default(null))
    .addOption(new Option("-v, --verbose", "Whether verbose logging mode is enabled").default(false))
    .addOption(new Option("-f, --force", "Whether removal of existing unpacked spawn should be forced").default(false))
    .action(unpackSpawn);
}
