import { Command, Option } from "commander";

import { packEquipmentIcons } from "#/icons/pack_equipment_icons";
import { packTextureDescriptions } from "#/icons/pack_texture_descriptions";
import { unpackEquipmentIcons } from "#/icons/unpack_equipment_icons";
import { unpackTextureDescriptions } from "#/icons/unpack_texture_descriptions";

export interface IIconsCommandParameters {
  description?: string;
  verbose?: boolean;
  strict?: boolean;
}

/**
 * Setup icons commands.
 */
export function setupIconsCommand(command: Command): void {
  const iconsCommand: Command = command.command("icons").description("custom icons pack and unpack commands");

  iconsCommand
    .command("unpack-equipment")
    .description("unpack equipment icons as separate entities for equipment sprite")
    .addOption(new Option("-v, --verbose", "print verbose logs"))
    .addOption(new Option("-s, --strict", "activate strict mode").default(true))
    .action(unpackEquipmentIcons);

  iconsCommand
    .command("pack-equipment")
    .description("pack separate icons as single dds file for equipment sprite")
    .addOption(new Option("-v, --verbose", "print verbose logs"))
    .addOption(new Option("-s, --strict", "activate strict mode").default(true))
    .action(packEquipmentIcons);

  iconsCommand
    .command("pack-descriptions")
    .description("pack separate icons as single dds file for XML descriptions")
    .addOption(new Option("-d, --description <name>", "name of description file to process"))
    .addOption(new Option("-v, --verbose", "print verbose logs"))
    .addOption(new Option("-s, --strict", "activate strict mode").default(true))
    .action(packTextureDescriptions);

  iconsCommand
    .command("unpack-descriptions")
    .description("pack separate icons as single dds file for XML descriptions")
    .addOption(new Option("-d, --description <name>", "name of description file to process"))
    .addOption(new Option("-v, --verbose", "print verbose logs"))
    .addOption(new Option("-s, --strict", "activate strict mode").default(true))
    .action(unpackTextureDescriptions);
}
