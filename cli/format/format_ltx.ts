import * as cp from "node:child_process";

import { blue } from "chalk";

import { GAME_DATA_LTX_CONFIGS_DIR, XRF_UTILS_PATH } from "#/globals";
import { NodeLogger } from "#/utils/logging";
import { TimeTracker } from "#/utils/timing";

const log: NodeLogger = NodeLogger.forFile(__filename);

export interface IFormatLtxParameters {
  check?: boolean;
  verbose?: boolean;
}

/**
 * Format game ltx config files.
 */
export async function formatLtx(parameters: IFormatLtxParameters = {}): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  log.info("Formatting ltx files");

  const timeTracker: TimeTracker = new TimeTracker().start();

  const command: string = `${XRF_UTILS_PATH} format-ltx -p ${GAME_DATA_LTX_CONFIGS_DIR} ${
    parameters.check ? "-c" : ""
  }`;

  log.info("Execute:", blue(command));

  cp.execSync(command, {
    stdio: "inherit",
  });

  log.info("Successfully executed format command, took:", timeTracker.end().getDuration() / 1000, "sec");
}
