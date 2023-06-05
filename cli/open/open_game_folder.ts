import * as path from "path";

import { red, yellow } from "chalk";

import { default as config } from "#/config.json";
import { NodeLogger, openFolderInExplorer } from "#/utils";

const log: NodeLogger = new NodeLogger("OPEN_GAME_FOLDER");

/**
 * Open game folder configured in config.json file with system explorer.
 */
export async function openGameFolder(): Promise<void> {
  log.info("Opening game folder");

  try {
    const gameFolderPath: string = path.resolve(config.targets.stalker_game_folder_path);

    log.info("Open system explorer in:", yellow(gameFolderPath));

    await openFolderInExplorer(gameFolderPath).catch(() => {});
  } catch (error) {
    log.error("Open folder error:", red(error.message));
  }
}
