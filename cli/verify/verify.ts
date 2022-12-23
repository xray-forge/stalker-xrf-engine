import * as fs from "fs/promises";
import * as path from "path";

import { default as chalk } from "chalk";

import { CLI_CONFIG, TARGET_GAME_DATA_DIR, TARGET_LOGS_DIR } from "#/build/globals";
import { default as config } from "#/config.json";
import { exists, NodeLogger } from "#/utils";

const GAME_LOGS_PATH: string = path.resolve(config.targets.STALKER_LOGS_FOLDER_PATH);
const GAME_PATH: string = path.resolve(config.targets.STALKER_GAME_FOLDER_PATH);
const GAME_BIN_PATH: string = path.resolve(GAME_PATH, "bin");
const GAME_GAMEDATA_PATH: string = path.resolve(GAME_PATH, "gamedata");
const GAME_BIN_JSON_PATH: string = path.resolve(GAME_BIN_PATH, "bin.json");

const log: NodeLogger = new NodeLogger("VERIFY");

(async function verify(): Promise<void> {
  log.info("Verifying project state");

  try {
    await verifyConfig();
    await verifyGamePath();
    await verifyGameEngine();
    await verifyGamedataLink();
    await verifyLogsLink();
  } catch (error) {
    log.error("verification failed failed:", chalk.red(error.message));
  }
})();

async function verifyConfig(): Promise<void> {
  if (await exists(CLI_CONFIG)) {
    log.info("Project cli/config.json:", chalk.greenBright("OK"));
  } else {
    log.warn(chalk.yellow("Config not found in cli/config.json:"), chalk.yellow(CLI_CONFIG));
  }
}

async function verifyGamePath(): Promise<void> {
  if (await exists(GAME_PATH)) {
    log.info("Game folder:", chalk.greenBright("OK"));
  } else {
    log.warn(chalk.yellow("Game folder is not correct, set path in cli/config.json:"), chalk.yellow(GAME_PATH));
  }
}

async function verifyGameEngine(): Promise<void> {
  const isGameDirPresent: boolean = await exists(GAME_PATH);
  const isBinDirPresent: boolean = await exists(GAME_BIN_PATH);
  const isBinCorrectlyProvided: boolean = await exists(GAME_BIN_JSON_PATH);

  if (isGameDirPresent && isBinDirPresent && isBinCorrectlyProvided) {
    log.info("Game engine:", chalk.greenBright("OK"));
  } else {
    if (!isBinDirPresent) {
      log.warn(
        chalk.yellow("Game bin folder does not exist, it was corrupted or incorrect path set in cli/config.json:"),
        chalk.yellow(GAME_BIN_PATH)
      );
    } else {
      log.warn(chalk.yellow("Open x-ray engine expected, using original in:"), chalk.yellow(GAME_BIN_PATH));
    }
  }
}

async function verifyGamedataLink(): Promise<void> {
  try {
    const linkPath: string = await fs.readlink(GAME_GAMEDATA_PATH);

    if (path.resolve(linkPath) === TARGET_GAME_DATA_DIR) {
      log.info("Gamedata link:", chalk.greenBright("OK"));
    } else {
      log.warn("Gamedata link points to unexpected place:", chalk.yellow(linkPath));
    }
  } catch (error) {
    log.info("Gamedata link:", chalk.yellow("FAIL"));
  }
}

async function verifyLogsLink(): Promise<void> {
  try {
    const linkPath: string = await fs.readlink(TARGET_LOGS_DIR);

    if (path.resolve(linkPath) === GAME_LOGS_PATH) {
      log.info("Logs link:", chalk.greenBright("OK"));
    } else {
      log.warn("Logs link points to unexpected place:", chalk.yellow(linkPath));
    }
  } catch (error) {
    log.info("Logs link:", chalk.yellow("FAIL"));
  }
}
