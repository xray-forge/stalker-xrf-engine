import { Command } from "commander";

import { packEquipmentIcons } from "#/icons/pack_equipment_icons";
import { packTextureDescriptions } from "#/icons/pack_texture_descriptions";
import { unpackEquipmentIcons } from "#/icons/unpack_equipment_icons";
import { unpackTextureDescriptions } from "#/icons/unpack_texture_descriptions";

/**
 * Setup icons commands.
 */
export function setupIconsCommand(command: Command): void {
  const iconsCommand: Command = command.command("icons").description("custom icons pack and unpack commands");

  iconsCommand
    .command("unpack-equipment")
    .description("unpack equipment icons as separate entities for equipment sprite")
    .action(unpackEquipmentIcons);

  iconsCommand
    .command("pack-equipment")
    .description("pack separate icons as single dds file for equipment sprite")
    .action(packEquipmentIcons);

  iconsCommand
    .command("pack-descriptions")
    .description("pack separate icons as single dds file for XML descriptions")
    .action(packTextureDescriptions);

  iconsCommand
    .command("unpack-descriptions")
    .description("pack separate icons as single dds file for XML descriptions")
    .action(unpackTextureDescriptions);
}
