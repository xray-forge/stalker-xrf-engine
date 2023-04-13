import { default as chalk } from "chalk";

import { ROOT_DIR } from "#/globals/paths";
import { NodeLogger, openFolderInExplorer } from "#/utils";

const log: NodeLogger = new NodeLogger("OPEN_GAME_FOLDER");

/**
 * Open project folder in system explorer.
 */
export async function openProjectFolder(): Promise<void> {
  log.info("Opening game folder");

  try {
    log.info("Open system explorer in:", chalk.yellow(ROOT_DIR));

    await openFolderInExplorer(ROOT_DIR).catch(() => {});
  } catch (error) {
    log.error("Open folder error:", chalk.red(error.message));
  }
}
