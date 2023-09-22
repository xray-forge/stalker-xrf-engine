import { red, yellow } from "chalk";

import { getGamePaths } from "#/utils/fs/get_game_paths";
import { openFolderInExplorer } from "#/utils/fs/open_folder_in_explorer";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = new NodeLogger("OPEN_GAME_FOLDER");

/**
 * Open game folder configured in config.json file with system explorer.
 */
export async function openGameFolder(): Promise<void> {
  log.info("Opening game folder");

  try {
    const { root: gameFolderPath } = await getGamePaths();

    log.info("Open system explorer in:", yellow(gameFolderPath));

    await openFolderInExplorer(gameFolderPath).catch(() => {});
  } catch (error) {
    log.error("Open folder error:", red(error.message));
  }
}
