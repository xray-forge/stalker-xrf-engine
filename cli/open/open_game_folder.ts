import * as path from "path";

import { default as chalk } from "chalk";

import { default as config } from "#/config.json";
import { NodeLogger, openFolderInExplorer } from "#/utils";

const log: NodeLogger = new NodeLogger("OPEN_GAME_FOLDER");

(async function unlinkFolders(): Promise<void> {
  log.info("Opening game folder");

  try {
    const gameFolderPath: string = path.resolve(config.targets.STALKER_GAME_FOLDER_PATH);

    log.info("Open system explorer in:", chalk.yellow(gameFolderPath));

    await openFolderInExplorer(gameFolderPath).catch(() => {});
  } catch (error) {
    log.error("Open folder error:", chalk.red(error.message));
  }
})();
