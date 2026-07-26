import * as fs from "node:fs";
import * as path from "node:path";

import { blueBright, yellow } from "chalk";

import { LAUNCHER_PREFIX } from "#/checks/utils/discover_checks";
import { TARGET_GAME_DATA_CHECKS_DIR, TARGET_GAME_DATA_SCRIPTS_DIR } from "#/globals/paths";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = NodeLogger.forFile(__filename);

export interface ICleanChecksParameters {
  verbose?: boolean;
}

/**
 * Remove every check artifact from gamedata.
 *
 * Packing copies gamedata as it stands, so run this before a release pack.
 */
export async function cleanChecks(parameters: ICleanChecksParameters = {}): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  log.info(blueBright("Clean checks"));

  if (fs.existsSync(TARGET_GAME_DATA_CHECKS_DIR)) {
    fs.rmSync(TARGET_GAME_DATA_CHECKS_DIR, { recursive: true, force: true });
    log.info("Removed:", yellow(TARGET_GAME_DATA_CHECKS_DIR));
  } else {
    log.info("Nothing to remove in", yellow(TARGET_GAME_DATA_CHECKS_DIR));
  }

  let removedLaunchers: number = 0;

  if (fs.existsSync(TARGET_GAME_DATA_SCRIPTS_DIR)) {
    for (const entry of fs.readdirSync(TARGET_GAME_DATA_SCRIPTS_DIR)) {
      if (entry.startsWith(LAUNCHER_PREFIX)) {
        fs.rmSync(path.resolve(TARGET_GAME_DATA_SCRIPTS_DIR, entry), { force: true });
        removedLaunchers += 1;

        log.debug("Removed launcher:", entry);
      }
    }
  }

  log.info("Removed launchers:", removedLaunchers);
}
