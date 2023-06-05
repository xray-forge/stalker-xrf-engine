import fsPromises from "fs/promises";
import path from "path";

import { yellow } from "chalk";

import { GAME_BIN_BACKUP_PATH, GAME_BIN_PATH } from "#/globals";
import { exists, NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("ROLLBACK_ENGINE");

/**
 * Rollback current engine to the default one.
 */
export async function rollbackEngine(): Promise<void> {
  log.info("Rollback engine to backup");

  const isBinBackupExist: boolean = await exists(GAME_BIN_BACKUP_PATH);
  const isLinkedEngine: boolean = await exists(path.resolve(GAME_BIN_PATH, "bin.json"));

  if (isBinBackupExist) {
    log.info("Backup detected:", yellow(GAME_BIN_BACKUP_PATH));

    if (isLinkedEngine) {
      log.info("Perform rollback operation");

      await fsPromises.unlink(GAME_BIN_PATH);
      await fsPromises.rename(GAME_BIN_BACKUP_PATH, GAME_BIN_PATH);

      log.info("Rollback performed");
    } else {
      log.info("Seems like 'bin' directory is not linked, no 'bin.json' file in it. Interrupt rollback");
    }
  } else {
    log.info("Backup folder not found, no way to rollback changes:", yellow(GAME_BIN_BACKUP_PATH));
  }
}
