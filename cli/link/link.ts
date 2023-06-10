import * as fsPromises from "fs/promises";

import { blue, red, yellow, yellowBright } from "chalk";

import { TARGET_GAME_DATA_DIR, TARGET_GAME_LINK_DIR, TARGET_LOGS_LINK_DIR } from "#/globals/paths";
import { exists, getGamePaths, NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("LINK");
const isForceLink: boolean = process.argv.includes("--force");

/**
 * Link gamedata/engine/logs folders.
 */
export async function linkFolders(): Promise<void> {
  log.info("Linking engine mod development folders");

  try {
    await linkGameFolder();
    await linkGamedataFolders();
    await linkLogsFolders();

    log.pushNewLine();
  } catch (error) {
    log.error("Links creation failed:", red(error.message));
  }
}

/**
 * Link target gamedata folder for faster / easier development
 */
async function linkGamedataFolders(): Promise<void> {
  log.info("Linking gamedata folders");

  const { gamedata: gameGamedataFolderPath } = await getGamePaths();

  if (await exists(gameGamedataFolderPath)) {
    if (isForceLink) {
      log.info("Forcing link as it already exists:", blue(gameGamedataFolderPath));

      await fsPromises.rm(gameGamedataFolderPath, { recursive: true });
    } else {
      log.warn("Skip, already exists:", blue(gameGamedataFolderPath));

      return;
    }
  }

  await fsPromises.symlink(TARGET_GAME_DATA_DIR, gameGamedataFolderPath, "junction");

  log.info("Linked folders:", yellow(TARGET_GAME_DATA_DIR), "->", yellowBright(gameGamedataFolderPath));
}

/**
 * Link game folder.
 */
async function linkGameFolder(): Promise<void> {
  log.info("Linking game folders");

  const { root: gameFolderPath } = await getGamePaths();

  if (await exists(TARGET_GAME_LINK_DIR)) {
    if (isForceLink) {
      log.info("Forcing link as it already exists:", blue(TARGET_GAME_LINK_DIR));

      await fsPromises.rm(TARGET_GAME_LINK_DIR, { recursive: true });
    } else {
      log.warn("Skip, already exists:", blue(TARGET_GAME_LINK_DIR));

      return;
    }
  }

  await fsPromises.symlink(gameFolderPath, TARGET_GAME_LINK_DIR, "junction");

  log.info("Linked folders:", yellow(gameFolderPath), "->", yellowBright(TARGET_GAME_LINK_DIR));
}

/**
 * Link open-xray logs folder for easier check in project.
 */
async function linkLogsFolders(): Promise<void> {
  log.info("Linking logs folders");

  const { logs: logsFolderPath } = await getGamePaths();

  if (await exists(TARGET_LOGS_LINK_DIR)) {
    if (isForceLink) {
      log.info("Forcing link as it already exists:", blue(TARGET_LOGS_LINK_DIR));

      await fsPromises.rm(TARGET_LOGS_LINK_DIR, { recursive: true });
    } else {
      log.warn("Skip, already exists:", blue(TARGET_LOGS_LINK_DIR));

      return;
    }
  }

  await fsPromises.symlink(logsFolderPath, TARGET_LOGS_LINK_DIR, "junction");

  log.info("Linked folders:", yellow(logsFolderPath), "->", yellowBright(TARGET_LOGS_LINK_DIR));
}
