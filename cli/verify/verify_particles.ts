import * as cp from "child_process";
import * as path from "path";

import { blue } from "chalk";

import { GAME_DATA_PARTICLES_DIR, RESOURCES_DIR, XRF_UTILS_PATH } from "#/globals";
import { NodeLogger } from "#/utils/logging";
import { TimeTracker } from "#/utils/timing";

const log: NodeLogger = new NodeLogger("VERIFY_PARTICLES");

export interface IFormatParticlesParameters {
  verbose?: boolean;
}

/**
 * Verify game particles files (packed and unpacked).
 */
export async function verifyParticles(parameters: IFormatParticlesParameters = {}): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  log.info("Verifying particles files");

  const timeTracker: TimeTracker = new TimeTracker().start();

  const unpackedCommand: string = `${XRF_UTILS_PATH} verify-particles -p ${GAME_DATA_PARTICLES_DIR} -u`;
  const packedCommand: string = `${XRF_UTILS_PATH} verify-particles -p ${path.join(RESOURCES_DIR, "particles.xr")}`;

  log.info("Execute:", blue(packedCommand));
  cp.execSync(packedCommand, { stdio: "inherit" });
  log.info("Verified packed particles file");

  log.info("Execute:", blue(unpackedCommand));
  cp.execSync(unpackedCommand, { stdio: "inherit" });
  log.info("Verified unpacked particles");

  log.info("Successfully executed verify commands, took:", timeTracker.end().getDuration() / 1000, "sec");
}
