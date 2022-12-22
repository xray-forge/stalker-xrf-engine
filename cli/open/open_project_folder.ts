import { default as chalk } from "chalk";

import { ROOT_DIR } from "#/build/globals";
import { Logger, openFolderInExplorer } from "#/utils";

const log: Logger = new Logger("OPEN_GAME_FOLDER");

(async function unlinkFolders(): Promise<void> {
  log.info("Opening game folder");

  try {
    log.info("Open system explorer in:", chalk.yellow(ROOT_DIR));

    await openFolderInExplorer(ROOT_DIR).catch(() => {});
  } catch (error) {
    log.error("Open folder error:", chalk.red(error.message));
  }
})();
