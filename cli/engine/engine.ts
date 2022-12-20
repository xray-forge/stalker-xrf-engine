import * as fsPromises from "fs/promises";
import * as path from "path";

import { default as chalk } from "chalk";

import { OPEN_XRAY_ENGINES_DIR, XR_ENGINE_BACKUP_DIR } from "#/build/globals";
import { default as config } from "#/config.json";
import { exists, Logger } from "#/utils";

enum EEngineCmd {
  INFO = "info",
  ROLLBACK = "rollback",
  LIST = "list",
  USE = "use"
}

const cmd: string = process.argv[2];
const args: Array<string> = process.argv.slice(3);
const log: Logger = new Logger("ENGINE");

const GAME_DIR: string = path.resolve(config.targets.STALKER_GAME_FOLDER_PATH);
const GAME_BIN_DIR: string = path.resolve(GAME_DIR, "bin");
const GAME_BIN_BACKUP_DIR: string = path.resolve(GAME_DIR, XR_ENGINE_BACKUP_DIR);

(async function manageEngine(): Promise<void> {
  log.info("Running manage script:", chalk.yellow(cmd));

  try {
    switch (cmd) {
      case EEngineCmd.INFO:
        return await printEngineInfo();

      case EEngineCmd.ROLLBACK:
        return await rollbackEngineToOriginal();

      case EEngineCmd.LIST:
        return await printEngineList();

      case EEngineCmd.USE:
        return await switchEngine();

      default:
        log.info(
          `Unknown argument supplied: '${chalk.yellow(cmd)}'. Expected one of: ${chalk.yellow(
            Object.values(EEngineCmd)
          )}`
        );
    }
  } catch (error) {
    log.error("Manage script failed:", chalk.red(error.message));
  }
})();

async function printEngineInfo(): Promise<void> {
  log.info("Getting engine info");

  const engineDescriptorPath: string = path.resolve(GAME_BIN_DIR, "bin.json");

  const isBinBackupExist: boolean = await exists(GAME_BIN_BACKUP_DIR);
  const isLinkedEngine: boolean = await exists(engineDescriptorPath);

  if (isBinBackupExist) {
    log.info("Backup version of engine exists:", chalk.yellow(GAME_BIN_BACKUP_DIR));
  } else {
    log.info("No backup version of engine detected:", chalk.yellow(GAME_BIN_BACKUP_DIR));
  }

  if (isLinkedEngine) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(engineDescriptorPath);

    log.info("Linked X-Ray engine detected");
    log.info("Linked X-Ray variant:", chalk.blue(config.type));
    log.info("Linked X-Ray version:", chalk.blue(config.version));
    log.info("Linked X-Ray release:", chalk.blue(config.release));
  } else {
    log.info("Using not linked engine, manually provided or original X-Ray is active");
  }
}

async function rollbackEngineToOriginal(): Promise<void> {
  log.info("Rollback engine to backup");

  const isBinBackupExist: boolean = await exists(GAME_BIN_BACKUP_DIR);
  const isLinkedEngine: boolean = await exists(path.resolve(GAME_BIN_DIR, "bin.json"));

  if (isBinBackupExist) {
    log.info("Backup detected:", chalk.yellow(GAME_BIN_BACKUP_DIR));

    if (isLinkedEngine) {
      log.info("Perform rollback operation");

      await fsPromises.unlink(GAME_BIN_DIR);
      await fsPromises.rename(GAME_BIN_BACKUP_DIR, GAME_BIN_DIR);

      log.info("Rollback performed");
    } else {
      log.info("Seems like 'bin' directory is not linked, no 'bin.json' file in it. Interrupt rollback");
    }
  } else {
    log.info("Backup folder not found, no way to rollback changes:", chalk.yellow(GAME_BIN_BACKUP_DIR));
  }
}

async function printEngineList(): Promise<void> {
  log.info("Available engines:");

  const engines: Array<string> = await getEnginesList();

  engines.forEach((it) => log.info("->", chalk.yellow(it)));
}

async function switchEngine(): Promise<void> {
  log.info("Switching engine");

  const desiredVersion: string = String(args[0]).trim();
  const engines: Array<string> = await getEnginesList();

  if (engines.includes(desiredVersion)) {
    const engineBinDir: string = path.resolve(OPEN_XRAY_ENGINES_DIR, desiredVersion, "bin");

    log.info("Switching to:", chalk.yellow(desiredVersion));
    log.info("Linking:", chalk.yellow(engineBinDir), "->", chalk.yellow(GAME_BIN_DIR));

    const isBinFolderExist: boolean = await exists(GAME_BIN_DIR);
    const isLinkedEngine: boolean = await exists(path.resolve(GAME_BIN_DIR, "bin.json"));

    if (isLinkedEngine) {
      log.info("Engine is already linked, removing old link");
      await fsPromises.unlink(GAME_BIN_DIR);
    } else if (isBinFolderExist) {
      log.info("Unlinked engine detected");
      await fsPromises.rename(GAME_BIN_DIR, GAME_BIN_BACKUP_DIR);
      log.info("Created backup at:", chalk.yellow(GAME_BIN_BACKUP_DIR));
    }

    await fsPromises.symlink(engineBinDir, GAME_BIN_DIR, "junction");

    log.info("Linked engines:", chalk.yellow(engineBinDir), "->", chalk.yellow(GAME_BIN_DIR));
  } else {
    log.error("Supplied unknown engine version:", chalk.yellow(desiredVersion));
    log.error("Only following are available:", engines);
  }
}

/**
 * Return list of available binaries.
 */
async function getEnginesList(): Promise<Array<string>> {
  return await fsPromises.readdir(OPEN_XRAY_ENGINES_DIR);
}
