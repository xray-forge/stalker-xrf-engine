import { blueBright, green, greenBright } from "chalk";

import { discoverChecks, ICheckDescriptor } from "#/checks/utils/discover_checks";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = NodeLogger.forFile(__filename);

/**
 * Print discovered flows and the console command that walks each one.
 */
export async function listChecks(): Promise<void> {
  const checks: Array<ICheckDescriptor> = discoverChecks();

  log.info(blueBright("Flows:"), checks.length);

  for (const check of checks) {
    log.info(" ", greenBright(check.command));
    log.info("   ", green("source:"), check.relative);
    log.info("   ", green("module:"), check.module);
  }
}
