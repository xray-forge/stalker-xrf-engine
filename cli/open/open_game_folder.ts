import { red, yellow } from "chalk";

import { getGamePaths } from "#/utils/fs/get_game_paths";
import { openFolderInExplorer } from "#/utils/fs/open_folder_in_explorer";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = NodeLogger.forFile(__filename);

/**
 * Open the game folder configured in the config.json file with a system explorer.
 */
export async function openGameFolder(): Promise<void> {
  log.info("Opening game folder");

  try {
    const { root: gameFolderPath } = await getGamePaths();

    log.info("Open system explorer in:", yellow(gameFolderPath));

    await openFolderInExplorer(gameFolderPath).catch(() => {});
  } catch (error: unknown) {
    log.error("Open folder error:", error instanceof Error ? red(error.message) : error);
  }
}
