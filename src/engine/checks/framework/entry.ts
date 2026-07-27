import { abort, TName } from "xray16/lib";

import { ICheckResult, reportBanner } from "@/engine/checks/framework/core";
import { drainRegistration, IRegistration } from "@/engine/checks/framework/dsl";
import { runFlow } from "@/engine/checks/framework/flow";

/**
 * What the generated launchers call.
 *
 * A source file has no exports, so the launcher requires it for its side effects and then names it here.
 * The name comes from the build, which is what keeps it from drifting away from the console command that
 * runs it.
 */

/**
 * Run whatever the just required source file registered.
 *
 * @param name - Name the launcher reports, e.g. `quests_zat_b14`.
 * @returns Result of the run.
 */
export function run(name: TName): ICheckResult {
  const registration: IRegistration = drainRegistration();

  if (registration.steps.length() === 0) {
    abort("checks: '%s' registered no steps. A flow declares them with step() at module scope.", name);
  }

  reportBanner(name);

  return runFlow(name, registration);
}
