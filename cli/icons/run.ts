import { Command } from "commander";

import { packEquipmentIcons } from "#/icons/pack_equipment_icons";
import { unpackEquipmentIcons } from "#/icons/unpack_equipment_icons";

/**
 * Setup icons commands.
 */
export function setupIconsCommand(command: Command): void {
  const iconsCommand: Command = command.command("icons").description("custom icons pack and unpack commands");

  iconsCommand
    .command("unpack-equipment")
    .description("unpack equipment icons as separate entities")
    .action(unpackEquipmentIcons);

  iconsCommand
    .command("pack-equipment")
    .description("pack separate icons as single dds file")
    .action(packEquipmentIcons);
}
