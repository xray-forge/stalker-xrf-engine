import { red, yellow } from "chalk";

import { ROOT_DIR } from "#/globals/paths";
import { openFolderInExplorer } from "#/utils/fs/open_folder_in_explorer";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = NodeLogger.forFile(__filename);

/**
 * Open the project folder in a system explorer.
 */
export async function openProjectFolder(): Promise<void> {
  log.info("Opening game folder");

  try {
    log.info("Open system explorer in:", yellow(ROOT_DIR));

    await openFolderInExplorer(ROOT_DIR).catch(() => {});
  } catch (error) {
    log.error("Open folder error:", error instanceof Error ? red(error.message) : error);
  }
}
