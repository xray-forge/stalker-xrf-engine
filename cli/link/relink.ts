import { red } from "chalk";

import { linkFolders } from "#/link/link";
import { unlinkFolders } from "#/link/unlink";
import { NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("RELINK");

/**
 * Re-link gamedata/engine/logs folders.
 */
export async function relinkFolders(): Promise<void> {
  log.info("Performing relink");

  try {
    await unlinkFolders();
    await linkFolders();

    log.info("Relinked game folders");
  } catch (error) {
    log.error("Links creation failed:", red(error.message));
  }
}
