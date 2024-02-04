import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";

import { blue, green, red, yellowBright } from "chalk";

import { default as config } from "#/config.json";
import { ROOT_DIR } from "#/globals";
import { deleteDirIfExists } from "#/utils/fs/delete_dir_if_exists";
import { NodeLogger } from "#/utils/logging";
import { Optional } from "#/utils/types";

const log: NodeLogger = new NodeLogger("CLONE_REPOSITORY");

/**
 * Parameters of CLI clone command.
 */
export interface ICloneRepositoryParameters {
  verbose?: boolean;
  force?: boolean;
  safe?: boolean;
  list?: boolean;
}

/**
 * Clone provided repository for simplified additional resources usage.
 */
export async function cloneRepository(name: Optional<string>, parameters: ICloneRepositoryParameters): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  const cloneDirectoryRoot: string = path.resolve(ROOT_DIR, "..");

  if (parameters.list) {
    return printPossibleCloneOptions();
  }

  log.info("Cloning repository:", blue(name));
  log.info("Cloning into root:", yellowBright(cloneDirectoryRoot));

  const targetRepositoryUrl: Optional<string> = name ? config.repositories[name]?.url : null;

  /**
   * Validate input parameters.
   */
  if (!name) {
    log.error("Invalid name option provided:", red(name));

    throw new Error(
      "Expected valid repository name from list, try checking usage with '--help' and list with '--list' command flags."
    );
  } else if (!config.repositories[name]) {
    log.error("Not existing name option provided:", red(name));

    printPossibleCloneOptions();

    throw new Error(
      "Expected valid repository name from list, try checking list of possible options with '--list' command flag."
    );
  } else if (!targetRepositoryUrl) {
    log.error("Provided option config has no repository link:", red(name), red(targetRepositoryUrl));

    throw new Error("Possibly corrupted config, no repository link in provided option.");
  }

  const pathDetails: path.ParsedPath = path.parse(targetRepositoryUrl);
  const targetRepositoryDirectory: string = path.resolve(cloneDirectoryRoot, pathDetails.name);
  const command: string = `git clone ${targetRepositoryUrl}`;
  const isAlreadyCloned: boolean = fs.existsSync(targetRepositoryDirectory);

  /**
   * Check target destination.
   */
  if (parameters.force) {
    log.warn("Forcing overwrite of target directory:", yellowBright(targetRepositoryDirectory));

    if (deleteDirIfExists(targetRepositoryDirectory)) {
      log.info("Successfully removed path:", yellowBright(targetRepositoryDirectory));
    }
  } else if (isAlreadyCloned) {
    if (parameters.safe) {
      log.info("Already cloned:", yellowBright(targetRepositoryDirectory), "from", green(targetRepositoryUrl));

      return;
    } else {
      log.error("Directory already exists for provided option:", red(cloneDirectoryRoot), red(pathDetails.name));
      log.error("Consider removing already existing one");

      throw new Error("Provided clone option that is already cloned.");
    }
  }

  log.info("Running:", yellowBright(command));

  cp.execSync(command, {
    cwd: cloneDirectoryRoot,
    stdio: "inherit",
  });

  log.info("Cloned repository successfully:", yellowBright(targetRepositoryDirectory));
}

/**
 * Print in console list of possible options.
 */
function printPossibleCloneOptions(): void {
  log.info("Possible options to clone:");

  return Object.keys(config.repositories).forEach((it) => log.info(" -", blue(it)));
}
