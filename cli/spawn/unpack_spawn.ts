import * as cp from "child_process";
import * as path from "path";

import { blue } from "chalk";

import { default as config } from "#/config.json";
import { CLI_DIR, TARGET_DIR, XRF_UTILS_PATH } from "#/globals";
import { NodeLogger } from "#/utils/logging";
import { TimeTracker } from "#/utils/timing";

const log: NodeLogger = new NodeLogger("FORMAT_LTX");

export interface IFormatLtxParameters {
  verbose?: boolean;
  path?: string;
  dest?: string;
  force?: boolean;
}

/**
 * Unpack spawn file.
 */
export async function unpackSpawn(parameters: IFormatLtxParameters = {}): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  log.info("Unpacking all.spawn file:");

  const timeTracker: TimeTracker = new TimeTracker().start();
  const from: string = parameters.path ?? getDefaultSpawnFilePath();
  const to: string = parameters.dest ?? path.resolve(TARGET_DIR, "all_spawn");

  const command: string = `${XRF_UTILS_PATH} unpack-spawn -p ${from} -d ${to} ${parameters.force ? "-f" : ""}`;

  log.info("Execute:", blue(command));

  cp.execSync(command, {
    cwd: TARGET_DIR,
    stdio: "inherit",
  });

  log.info("Successfully executed unpack spawn command, took:", timeTracker.end().getDuration() / 1000, "sec");
}

/**
 * @returns path to default spawn file for usage, if no path parameter provided for command
 */
function getDefaultSpawnFilePath(): string {
  if (!config.resources.mod_assets_override_folders.length) {
    throw new Error("Unexpected unpack spawn call - no mod asset overrides defined.");
  }

  return path.resolve(CLI_DIR, config.resources.mod_assets_override_folders[0], "spawns", "all.spawn");
}
