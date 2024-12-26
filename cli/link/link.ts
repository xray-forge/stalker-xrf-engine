import * as fsp from "fs/promises";

import { blue, red, yellow, yellowBright } from "chalk";

import {
  PLUS_SIGN,
  SKIP_SIGN,
  TARGET_GAME_DATA_DIR,
  TARGET_GAME_LINK_DIR,
  TARGET_LOGS_LINK_DIR,
  WARNING_SIGN,
} from "#/globals";
import { exists } from "#/utils/fs/exists";
import { getGamePaths } from "#/utils/fs/get_game_paths";
import { isSamePath } from "#/utils/fs/is_same_path";
import { NodeLogger } from "#/utils/logging";
import { Optional } from "#/utils/types";

const log: NodeLogger = new NodeLogger("LINK");

export interface ILinkCommandParameters {
  force?: boolean;
}

/**
 * Link gamedata/engine/logs dirs.
 *
 * @param parameters - command arguments
 */
export async function linkFolders(parameters: ILinkCommandParameters): Promise<void> {
  log.info("Linking engine mod development folders");

  try {
    await linkGameFolder(parameters);
    await linkGamedataFolders(parameters);
    await linkLogsFolders(parameters);
  } catch (error) {
    log.error("Links creation failed:", red(error.message));
  }
}

/**
 * Link target gamedata folder for faster / easier development
 *
 * @param parameters - command arguments
 */
async function linkGamedataFolders(parameters: ILinkCommandParameters): Promise<void> {
  log.info("Linking gamedata folders");

  const { gamedata: gameGamedataFolderPath } = await getGamePaths();

  if (await exists(gameGamedataFolderPath)) {
    const linkPath: Optional<string> = await fsp.readlink(gameGamedataFolderPath).catch(() => null);
    const isLink: boolean = linkPath !== null;

    if (parameters.force) {
      log.info("Forcing link as it already exists:", blue(gameGamedataFolderPath));

      if (!isLink) {
        log.warn(WARNING_SIGN, "Removing already existing gamedata folder");
      }

      await fsp.rm(gameGamedataFolderPath, { recursive: true });
    } else {
      if (isLink && isSamePath(linkPath, TARGET_GAME_DATA_DIR)) {
        log.warn(SKIP_SIGN, "Skip, gamedata link already exists:", blue(gameGamedataFolderPath));
      } else if (isLink) {
        log.warn(WARNING_SIGN, "Skip, gamedata link already exists but points to another place:", red(linkPath));
      } else {
        log.warn(WARNING_SIGN, "Gamedata directory exists and cannot be linked. Remove it manually or use '--force'");
      }

      return;
    }
  }

  await fsp.symlink(TARGET_GAME_DATA_DIR, gameGamedataFolderPath, "junction");

  log.info(PLUS_SIGN, "Linked folders:", yellow(TARGET_GAME_DATA_DIR), "->", yellowBright(gameGamedataFolderPath));
}

/**
 * Link game folder.
 *
 * @param parameters - command arguments
 */
async function linkGameFolder(parameters: ILinkCommandParameters): Promise<void> {
  log.info("Linking game folders");

  const { root: gameFolderPath } = await getGamePaths();

  if (await exists(TARGET_GAME_LINK_DIR)) {
    if (parameters.force) {
      log.info("Forcing new link creation:", blue(TARGET_GAME_LINK_DIR));

      await fsp.rm(TARGET_GAME_LINK_DIR, { recursive: true });
    } else {
      log.warn(SKIP_SIGN, "Skip, game link already exists:", blue(TARGET_GAME_LINK_DIR));

      return;
    }
  }

  await fsp.symlink(gameFolderPath, TARGET_GAME_LINK_DIR, "junction");

  log.info(PLUS_SIGN, "Linked folders:", yellow(gameFolderPath), "->", yellowBright(TARGET_GAME_LINK_DIR));
}

/**
 * Link open-xray logs folder for easier check in project.
 *
 * @param parameters - command arguments
 */
async function linkLogsFolders(parameters: ILinkCommandParameters): Promise<void> {
  log.info("Linking logs folders");

  const { logs: logsFolderPath } = await getGamePaths();

  if (await exists(TARGET_LOGS_LINK_DIR)) {
    if (parameters.force) {
      log.info("Forcing new link creation:", blue(TARGET_LOGS_LINK_DIR));

      await fsp.rm(TARGET_LOGS_LINK_DIR, { recursive: true });
    } else {
      log.warn(SKIP_SIGN, "Skip, logs link already exists:", blue(TARGET_LOGS_LINK_DIR));

      return;
    }
  }

  await fsp.symlink(logsFolderPath, TARGET_LOGS_LINK_DIR, "junction");

  log.info(PLUS_SIGN, "Linked folders:", yellow(logsFolderPath), "->", yellowBright(TARGET_LOGS_LINK_DIR));
}
