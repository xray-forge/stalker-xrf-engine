import { Command, Option } from "commander";

import { packParticles } from "#/particles/pack_particles";
import { unpackParticles } from "#/particles/unpack_particles";

/**
 * Setup particles commands.
 */
export function setupParticlesCommands(command: Command): void {
  const particlesCommand: Command = command.command("particles").description("particles.xr file commands");

  particlesCommand
    .command("unpack")
    .description("unpack particles file as separate ltx configs")
    .addOption(new Option("-p, --path <path>", "Source particles file path to unpack").default(null))
    .addOption(new Option("-d, --dest <dest>", "Output destination to unpack particles file").default(null))
    .addOption(new Option("-v, --verbose", "Whether verbose logging mode is enabled").default(false))
    .addOption(
      new Option("-f, --force", "Whether removal of existing unpacked particles should be forced").default(false)
    )
    .action(unpackParticles);

  particlesCommand
    .command("pack")
    .description("pack particles configs as .xr file")
    .addOption(new Option("-p, --path <path>", "Source particles directory to pack").default(null))
    .addOption(new Option("-d, --dest <dest>", "Output destination file to pack").default(null))
    .addOption(new Option("-v, --verbose", "Whether verbose logging mode is enabled").default(false))
    .addOption(
      new Option("-f, --force", "Whether removal of existing unpacked particles should be forced").default(false)
    )
    .action(packParticles);
}
