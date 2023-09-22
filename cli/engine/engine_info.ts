import { blue, yellow } from "chalk";

import { exists, getGamePaths } from "#/utils/fs";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = new NodeLogger("ENGINE_INFO");

/**
 * Print current active engine info.
 */
export async function printEngineInfo(): Promise<void> {
  log.info("Getting engine info");

  const { binJson, binXrfBackup } = await getGamePaths();

  const engineDescriptorPath: string = binJson;

  const isBinBackupExist: boolean = await exists(binXrfBackup);
  const isLinkedEngine: boolean = await exists(engineDescriptorPath);

  if (isBinBackupExist) {
    log.info("Backup version of engine exists:", yellow(binXrfBackup));
  } else {
    log.info("No backup version of engine detected:", yellow(binXrfBackup));
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
