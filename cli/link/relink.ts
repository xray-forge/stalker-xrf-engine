import { red } from "chalk";

import { linkFolders } from "#/link/link";
import { unlinkFolders } from "#/link/unlink";
import { NodeLogger } from "#/utils/logging";
import { CLI_CONFIG } from "#/globals";

const log: NodeLogger = new NodeLogger("RELINK");

export interface IRelinkCommandParameters {
  force?: boolean;
}

/**
 * Re-link gamedata/engine/logs folders.
 *
 * @param parameters - command arguments
 */
export async function relinkFolders(parameters: IRelinkCommandParameters): Promise<void> {
  log.info("Performing relink");

  try {
    await unlinkFolders();
    await linkFolders(parameters);

    log.info("Relinked game folders");
  } catch (error) {
    log.error("Links creation failed:", red(error.message));
    log.error("Verify steam game installation path or provide fallback in:", CLI_CONFIG);
  }
}
