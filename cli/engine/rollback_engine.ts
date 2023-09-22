import fsp from "fs/promises";

import { yellow } from "chalk";

import { exists, getGamePaths } from "#/utils/fs";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = new NodeLogger("ROLLBACK_ENGINE");

/**
 * Rollback current engine to the default one.
 */
export async function rollbackEngine(): Promise<void> {
  log.info("Rollback engine to backup");

  const { binXrfBackup, bin, binJson } = await getGamePaths();

  const isBinBackupExist: boolean = await exists(binXrfBackup);
  const isLinkedEngine: boolean = await exists(binJson);

  if (isBinBackupExist) {
    log.info("Backup detected:", yellow(binXrfBackup));

    if (isLinkedEngine) {
      log.info("Perform rollback operation");

      await fsp.unlink(bin);
      await fsp.rename(binXrfBackup, bin);

      log.info("Rollback performed");
    } else {
      log.info("Seems like 'bin' directory is not linked, no 'bin.json' file in it. Interrupt rollback");
    }
  } else {
    log.info("Backup folder not found, no way to rollback changes:", yellow(binXrfBackup));
  }
}
