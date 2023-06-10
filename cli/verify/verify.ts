import * as fs from "fs/promises";
import * as path from "path";

import { greenBright, red, yellow, yellowBright } from "chalk";

import { default as config } from "#/config.json";
import { CLI_CONFIG, CLI_DIR, TARGET_GAME_DATA_DIR, TARGET_GAME_LINK_DIR, TARGET_LOGS_LINK_DIR } from "#/globals/paths";
import { exists, getGamePaths, NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("VERIFY");

/**
 * Verify project setup and configuration.
 */
export async function verify(): Promise<void> {
  log.info("Verifying project state");

  try {
    await verifyConfig();
    await verifyGamePath();
    await verifyGameLink();
    await verifyGameEngine();
    await verifyGamedataLink();
    await verifyLogsLink();
    await verifyAssets();
  } catch (error) {
    log.error("Verification failed:", red(error.message));
  }
}

/**
 * Verify if project config exists.
 */
async function verifyConfig(): Promise<void> {
  if (await exists(CLI_CONFIG)) {
    log.info("Project cli/config.json:", greenBright("OK"));
  } else {
    log.warn(yellow("Config not found in cli/config.json:"), yellow(CLI_CONFIG));
  }
}

/**
 * Verify if project game path exists and is correct.
 */
async function verifyGamePath(): Promise<void> {
  const { root, app } = await getGamePaths();

  if (await exists(root)) {
    log.info("Game folder:", greenBright("OK"));
  } else {
    log.warn(yellow("Game folder is not linked, set path in cli/config.json:"), yellow(root));
  }

  if (await exists(app)) {
    log.info("Game folder:", greenBright("OK"));
  } else {
    log.warn(yellow("Game folder is not linked, set path in cli/config.json:"), yellow(root));
  }
}

/**
 * Check if game is linked in gamedata.
 */
async function verifyGameLink(): Promise<void> {
  if (await exists(TARGET_GAME_LINK_DIR)) {
    log.info("Game link:", greenBright("OK"));
  } else {
    log.warn("Game link:", yellow("FAIL"));
  }
}

/**
 * Check if game assets are linked and extended
 */
async function verifyAssets(): Promise<void> {
  const baseResourcesPath: string = config.resources.mod_assets_base_folder;

  if (await exists(path.resolve(CLI_DIR, config.resources.mod_assets_base_folder))) {
    log.info("Base game resources:", yellowBright(baseResourcesPath), greenBright("OK"));
  } else {
    log.warn("Base game resources:", yellowBright(baseResourcesPath), yellow("FAIL"), "(issues possible)");
  }

  for (const entry of config.resources.mod_assets_override_folders) {
    if (await exists(path.resolve(CLI_DIR, entry))) {
      log.info("Override resources:", yellowBright(entry), greenBright("OK"));
    } else {
      log.warn("Override resources:", yellowBright(entry), yellow("FAIL"), "(packaging issues possible)");
    }
  }

  for (const entry of config.resources.mod_assets_locales[config.locale]) {
    if (await exists(path.resolve(CLI_DIR, entry))) {
      log.info("Locale resources:", yellowBright(entry), greenBright("OK"));
    } else {
      log.warn("Locale resources:", yellowBright(entry), yellow("FAIL"), "(packaging issues possible)");
    }
  }
}

/**
 * Check if any custom engine is used.
 */
async function verifyGameEngine(): Promise<void> {
  const { root, bin, binJson } = await getGamePaths();
  const isGameDirPresent: boolean = await exists(root);
  const isBinDirPresent: boolean = await exists(bin);
  const isBinCorrectlyProvided: boolean = await exists(binJson);

  if (isGameDirPresent && isBinDirPresent && isBinCorrectlyProvided) {
    log.info("Game engine link:", greenBright("OK"));
  } else {
    if (!isBinDirPresent) {
      log.warn(
        yellow("Game bin folder does not exist, it was corrupted or incorrect path set in cli/config.json:"),
        yellow(bin)
      );
    } else {
      log.warn(yellow("Open x-ray engine expected, using original in:"), yellow(bin));
    }
  }
}

/**
 * Check if gamedata folders are linked.
 */
async function verifyGamedataLink(): Promise<void> {
  try {
    const { gamedata } = await getGamePaths();
    const linkPath: string = await fs.readlink(gamedata);

    if (path.resolve(linkPath) === TARGET_GAME_DATA_DIR) {
      log.info("Gamedata link:", greenBright("OK"));
    } else {
      log.warn("Gamedata link points to unexpected place:", yellow(linkPath));
    }
  } catch (error) {
    log.info("Gamedata link:", yellow("FAIL"));
  }
}

/**
 * Check if logs folders are linked.
 */
async function verifyLogsLink(): Promise<void> {
  try {
    const { logs } = await getGamePaths();
    const linkPath: string = await fs.readlink(TARGET_LOGS_LINK_DIR);

    if (path.resolve(linkPath) === logs) {
      log.info("Logs link:", greenBright("OK"));
    } else {
      log.warn("Logs link points to unexpected place:", yellow(linkPath));
    }
  } catch (error) {
    log.info("Logs link:", yellow("FAIL"));
  }
}
