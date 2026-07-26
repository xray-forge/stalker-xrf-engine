import { blueBright, green, greenBright } from "chalk";

import {
  CHECK_LAUNCHER_PREFIX,
  discoverChecks,
  ICheckDescriptor,
  SUITE_IDENTITY,
} from "#/checks/utils/discover_checks";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = NodeLogger.forFile(__filename);

/**
 * Print discovered checks and the console command that runs each one.
 */
export async function listChecks(): Promise<void> {
  const checks: Array<ICheckDescriptor> = discoverChecks();

  log.info(blueBright("Checks:"), checks.length);

  for (const check of checks) {
    log.info(" ", greenBright(check.command), green(`[${check.kind}]`));
    log.info("   ", green("source:"), check.relative);
    log.info("   ", green("module:"), check.module);

    if (check.resetCommand) {
      log.info("   ", green("reset: "), check.resetCommand);
    }
  }

  if (checks.some((it) => it.kind === "check")) {
    log.info(" ", greenBright(`run_script ${CHECK_LAUNCHER_PREFIX}${SUITE_IDENTITY}`), green("[suite]"));
    log.info("   ", green("runs: "), "every check in sequence, flows excluded");
  }
}
