import * as fsPromises from "fs/promises";
import * as path from "path";

import { default as chalk } from "chalk";

import { default as config } from "#/config.json";
import { TARGET_GAME_LINK_DIR, TARGET_LOGS_LINK_DIR } from "#/globals/paths";
import { NodeLogger } from "#/utils";

import { Optional } from "@/engine/lib/types";

const log: NodeLogger = new NodeLogger("UNLINK");

/**
 * Unlink gamedata/engine/logs folders.
 */
export async function unlinkFolders(): Promise<void> {
  log.info("Unlinking engine development folders");

  try {
    const gameGamedataFolderPath: string = path.resolve(config.targets.STALKER_GAME_FOLDER_PATH, "gamedata");

    await unlink(gameGamedataFolderPath);
    await unlink(TARGET_LOGS_LINK_DIR);
    await unlink(TARGET_GAME_LINK_DIR);
  } catch (error) {
    log.error("Links removal failed:", chalk.red(error.message));
  }
}

/**
 * Link target gamedata folder for faster / easier development
 */
async function unlink(target: string): Promise<void> {
  log.info("Unlinking:", chalk.yellowBright(target));

  const stat: Optional<string> = await fsPromises.readlink(target).catch(() => null);

  if (!stat) {
    return log.info("Skip operation, target does not exist");
  }

  try {
    await fsPromises.unlink(target);
    log.info("Unlinked:", chalk.yellow(target));
  } catch (error) {
    log.error("Failed to unlink:", chalk.yellow(target));
    log.error("Check this folder, probably it was created manually or contains your own gamedata from another mod");

    throw error;
  }
}
