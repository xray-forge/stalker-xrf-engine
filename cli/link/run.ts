import { Command } from "commander";

import { linkFolders } from "#/link/link";
import { unlinkFolders } from "#/link/unlink";

/**
 * Setup link commands.
 */
export function setupLinkCommand(command: Command): void {
  command.command("link").description("link project folders").action(linkFolders);
  command.command("unlink").description("unlink project folders").action(unlinkFolders);
}
