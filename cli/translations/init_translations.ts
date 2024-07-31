import * as cp from "child_process";

import { blue, yellow } from "chalk";

import { XRF_UTILS_PATH } from "#/globals";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = new NodeLogger("INIT_TRANSLATIONS");

interface IInitTranslationParameters {
  verbose?: boolean;
}

/**
 * Init provided file path as JSON translation dictionary.
 */
export async function initTranslations(target: string, parameters: IInitTranslationParameters): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  log.info("Initialize translation:", yellow(target));
  log.debug("Running with parameters:", parameters);

  const command: string = `${XRF_UTILS_PATH} initialize-translations ${
    parameters.verbose ? "--verbose " : "--silent "
  }-p ${target}`;

  log.info("Execute check command:", blue(command));

  cp.execSync(command, {
    stdio: "inherit",
  });

  log.info("Initialized translations file(s)");
}
