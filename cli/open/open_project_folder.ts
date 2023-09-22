import { red, yellow } from "chalk";

import { ROOT_DIR } from "#/globals/paths";
import { openFolderInExplorer } from "#/utils/fs/open_folder_in_explorer";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = new NodeLogger("OPEN_GAME_FOLDER");

/**
 * Open project folder in system explorer.
 */
export async function openProjectFolder(): Promise<void> {
  log.info("Opening game folder");

  try {
    log.info("Open system explorer in:", yellow(ROOT_DIR));

    await openFolderInExplorer(ROOT_DIR).catch(() => {});
  } catch (error) {
    log.error("Open folder error:", red(error.message));
  }
}
