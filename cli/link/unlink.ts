import * as fsPromises from "fs/promises";

import { red, yellow, yellowBright } from "chalk";

import { TARGET_GAME_LINK_DIR, TARGET_LOGS_LINK_DIR } from "#/globals/paths";
import { getGamePaths, NodeLogger, Optional } from "#/utils";

const log: NodeLogger = new NodeLogger("UNLINK");

/**
 * Unlink gamedata/engine/logs folders.
 */
export async function unlinkFolders(): Promise<void> {
  log.info("Unlinking engine development folders");

  try {
    const { gamedata: gameGamedataFolderPath } = await getGamePaths();

    await unlink(gameGamedataFolderPath);
    await unlink(TARGET_LOGS_LINK_DIR);
    await unlink(TARGET_GAME_LINK_DIR);
  } catch (error) {
    log.error("Links removal failed:", red(error.message));
  }
}

/**
 * Link target gamedata folder for faster / easier development
 */
async function unlink(target: string): Promise<void> {
  log.info("Unlinking:", yellowBright(target));

  const stat: Optional<string> = await fsPromises.readlink(target).catch(() => null);

  if (!stat) {
    return log.info("Skip operation, target does not exist");
  }

  try {
    await fsPromises.unlink(target);
    log.info("Unlinked:", yellow(target));
  } catch (error) {
    log.error("Failed to unlink:", yellow(target));
    log.error("Check this folder, probably it was created manually or contains your own gamedata from another mod");

    throw error;
  }
}
