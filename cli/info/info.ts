import { default as chalk } from "chalk";

import { default as config } from "#/config.json";
import { TARGET_GAME_DATA_DIR, TARGET_GAME_DATA_METADATA_FILE } from "#/globals/paths";
import { NodeLogger } from "#/utils";

import { default as pkg } from "#/../package.json";

const log: NodeLogger = new NodeLogger("INFO");

/**
 * Print current project information summary.
 */
export async function printInfo(): Promise<void> {
  const separator: string = chalk.cyan("--------------------------------------");

  log.info("Current project info");
  log.info(separator);

  log.info("Project name:", pkg.name);
  log.info(separator);

  log.info("Game folder:", chalk.yellow(config.targets.STALKER_GAME_FOLDER_PATH));
  log.info("Game exe:", chalk.yellow(config.targets.STALKER_GAME_EXE_NAME));
  log.info(separator);

  log.info("Target build folder:", chalk.yellow(TARGET_GAME_DATA_DIR));
  log.info("Target build meta-info:", chalk.yellow(TARGET_GAME_DATA_METADATA_FILE));
  log.info(separator);

  log.info("Available scripts:");
  Object.keys(pkg.scripts).forEach((it) => log.info("npm run", chalk.blueBright(it)));
  log.info(separator);
}
