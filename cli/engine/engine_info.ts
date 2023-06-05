import * as path from "path";

import { blue, yellow } from "chalk";

import { GAME_BIN_BACKUP_PATH, GAME_BIN_PATH } from "#/globals";
import { exists, NodeLogger } from "#/utils";

const log: NodeLogger = new NodeLogger("ENGINE_INFO");

/**
 * Print current active engine info.
 */
export async function printEngineInfo(): Promise<void> {
  log.info("Getting engine info");

  const engineDescriptorPath: string = path.resolve(GAME_BIN_PATH, "bin.json");

  const isBinBackupExist: boolean = await exists(GAME_BIN_BACKUP_PATH);
  const isLinkedEngine: boolean = await exists(engineDescriptorPath);

  if (isBinBackupExist) {
    log.info("Backup version of engine exists:", yellow(GAME_BIN_BACKUP_PATH));
  } else {
    log.info("No backup version of engine detected:", yellow(GAME_BIN_BACKUP_PATH));
  }

  if (isLinkedEngine) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(engineDescriptorPath);

    log.info("Linked X-Ray engine detected");
    log.info("Linked X-Ray variant:", blue(config.type));
    log.info("Linked X-Ray version:", blue(config.version));
    log.info("Linked X-Ray release:", blue(config.release));
  } else {
    log.info("Using not linked engine, manually provided or original X-Ray is active");
  }
}
