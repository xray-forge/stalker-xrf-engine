import * as cp from "child_process";
import * as path from "path";

import { blue } from "chalk";

import { RESOURCES_DIR, TARGET_DIR, XRF_UTILS_PATH } from "#/globals";
import { NodeLogger } from "#/utils/logging";
import { TimeTracker } from "#/utils/timing";

const log: NodeLogger = new NodeLogger("UNPACK_SPAWN");

export interface IUnpackSpawnParameters {
  verbose?: boolean;
  path?: string;
  dest?: string;
  force?: boolean;
}

/**
 * Unpack spawn file.
 */
export async function unpackSpawn(parameters: IUnpackSpawnParameters = {}): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  log.info("Unpacking all.spawn file:");

  const timeTracker: TimeTracker = new TimeTracker().start();
  const from: string = parameters.path ?? path.resolve(RESOURCES_DIR, "spawns", "all.spawn");
  const to: string = parameters.dest ?? path.resolve(TARGET_DIR, "all_spawn");

  const command: string = `${XRF_UTILS_PATH} unpack-spawn -p ${from} -d ${to} ${parameters.force ? "-f" : ""}`;

  log.info("Execute:", blue(command));

  cp.execSync(command, {
    cwd: TARGET_DIR,
    stdio: "inherit",
  });

  log.info("Successfully executed unpack spawn command, took:", timeTracker.end().getDuration() / 1000, "sec");
}
