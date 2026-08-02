import * as cp from "node:child_process";

import { blue } from "chalk";

import { TARGET_GAME_DATA_DIR, XRF_UTILS_PATH } from "#/globals";
import { NodeLogger } from "#/utils/logging";
import { TimeTracker } from "#/utils/timing";

const log: NodeLogger = NodeLogger.forFile(__filename);

export interface IVerifyGamedataParameters {
  strict?: boolean;
  verbose?: boolean;
}

/**
 * Verify assembled gamedata files integrity.
 * Check textures/sounds/assets/meshes/animations etc.
 * Allows ensuring validity before running game and crashing in runtime.
 */
export async function verifyGamedata(parameters: IVerifyGamedataParameters = {}): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  log.info("Verifying gamedata files");

  const timeTracker: TimeTracker = new TimeTracker().start();

  const args: Array<string> = ["verify-gamedata", TARGET_GAME_DATA_DIR];

  if (parameters.strict) {
    args.push("-s");
  }

  if (parameters.verbose) {
    args.push("-v");
  }

  log.info("Execute:", blue([XRF_UTILS_PATH, ...args].join(" ")));

  try {
    cp.execFileSync(XRF_UTILS_PATH, args, { stdio: "inherit" });
    log.info("Successfully executed verify command, took:", timeTracker.end().getDuration() / 1000, "sec");
  } catch (error) {
    log.error("Gamedata verification command failed in:", timeTracker.end().getDuration() / 1000, "sec");

    throw error;
  }
}
