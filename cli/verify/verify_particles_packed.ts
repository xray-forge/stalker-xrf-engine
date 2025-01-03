import * as cp from "child_process";
import * as path from "path";

import { blue } from "chalk";

import { RESOURCES_DIR, XRF_UTILS_PATH } from "#/globals";
import { NodeLogger } from "#/utils/logging";
import { TimeTracker } from "#/utils/timing";

const log: NodeLogger = new NodeLogger("VERIFY_PARTICLES_PACKED");

export interface IFormatParticlesPackedParameters {
  verbose?: boolean;
}

/**
 * Verify game particles files (packed and unpacked).
 */
export async function verifyParticlesPacked(parameters: IFormatParticlesPackedParameters = {}): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  log.info("Verifying packed particles files");

  const timeTracker: TimeTracker = new TimeTracker().start();

  const command: string = `${XRF_UTILS_PATH} verify-particles -p ${path.join(RESOURCES_DIR, "particles.xr")}`;

  log.info("Execute:", blue(command));
  cp.execSync(command, { stdio: "inherit" });

  log.info("Successfully executed verify command, took:", timeTracker.end().getDuration() / 1000, "sec");
}
