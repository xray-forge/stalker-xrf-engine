import fsPromises from "fs/promises";
import path from "path";

import { default as chalk } from "chalk";

import { isValidEngine } from "#/engine/list_engines";
import { GAME_BIN_BACKUP_PATH, GAME_BIN_PATH, OPEN_XRAY_ENGINES_DIR } from "#/globals";
import { exists, NodeLogger, Optional } from "#/utils";

const log: NodeLogger = new NodeLogger("USE_ENGINE");

/**
 * Switch current game engine to provided one.
 */
export async function useEngine(target: string): Promise<void> {
  const desiredVersion: string = String(target).trim();

  if (isValidEngine(desiredVersion)) {
    const engineBinDir: string = path.resolve(OPEN_XRAY_ENGINES_DIR, desiredVersion, "bin");
    const possibleBinDescriptor: string = path.resolve(GAME_BIN_PATH, "bin.json");
    const isBinFolderExist: boolean = await exists(GAME_BIN_PATH);
    const isLinkedEngine: boolean = await exists(possibleBinDescriptor);
    const oldEngine: Optional<string> = isLinkedEngine ? (await import(possibleBinDescriptor)).type : null;

    log.info("Switching engine:", chalk.blue(oldEngine || "original"), "->", chalk.blue(desiredVersion));

    if (isLinkedEngine) {
      log.info("Removing old link");
      await fsPromises.unlink(GAME_BIN_PATH);
    } else if (isBinFolderExist) {
      log.info("Unlinked engine detected");
      await fsPromises.rename(GAME_BIN_PATH, GAME_BIN_BACKUP_PATH);
      log.info("Created backup at:", chalk.yellow(GAME_BIN_BACKUP_PATH));
    }

    log.info("Linking:", chalk.yellow(engineBinDir), "->", chalk.yellow(GAME_BIN_PATH));
    await fsPromises.symlink(engineBinDir, GAME_BIN_PATH, "junction");

    log.info("Link result:", chalk.green("OK"), "\n");
  } else {
    log.error("Supplied unknown engine version:", chalk.yellow(desiredVersion));
    log.error("Only following are available:");
  }
}
