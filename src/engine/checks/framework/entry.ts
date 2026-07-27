import { abort, Nillable, TCount, TLabel, TName } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { runCheck } from "@/engine/checks/framework/check";
import { ICheckResult, reportBanner } from "@/engine/checks/framework/core";
import { drainRegistration, IRegistration, TCheckKind } from "@/engine/checks/framework/dsl";
import { runFlow } from "@/engine/checks/framework/flow";

/**
 * What the generated launchers call.
 *
 * A source file has no exports, so the launcher requires it for its side effects and then names it
 * here. The name and the kind both come from the build, which is what keeps them from drifting away
 * from the console command that runs them.
 */

/**
 * Describe what a file registered, for the mismatch message.
 *
 * @param registration - Drained registration.
 * @returns Human readable summary of what was declared.
 */
function describeRegistration(registration: IRegistration): TLabel {
  const steps: TCount = registration.steps.length();
  const stages: TCount = registration.stages.length();

  if (steps > 0) {
    return `${steps} flow step(s)`;
  } else if (stages > 0) {
    return `${stages} check stage(s)`;
  }

  return "nothing";
}

/**
 * Refuse to run a file whose vocabulary does not match the kind its name says it is.
 *
 * Aborts rather than recording a failure. A file using the wrong vocabulary is a mistake in code we
 * wrote, not something the game did, so it must not land in the results file looking like a finding.
 *
 * @param name - Name the launcher reports.
 * @param kind - Kind the build determined from the source file suffix.
 * @param registration - Drained registration.
 */
function assertKindMatches(name: TName, kind: TCheckKind, registration: IRegistration): void {
  const isFlowShaped: boolean = registration.steps.length() > 0;
  const isCheckShaped: boolean = registration.stages.length() > 0 || $isNotNil(registration.beforeAll);

  const problem: Nillable<TLabel> =
    kind === "flow"
      ? isCheckShaped
        ? "declares check vocabulary"
        : null
      : isFlowShaped
        ? "declares flow vocabulary"
        : null;

  if ($isNil(problem)) {
    return;
  }

  abort(
    "checks: '%s' is a %s but %s (registered %s). Use step() in a .flow.ts, it()/beforeAll() in a .check.ts.",
    name,
    kind,
    problem,
    describeRegistration(registration)
  );
}

/**
 * Run whatever the just required source file registered.
 *
 * @param name - Name the launcher reports, e.g. `quests_zat_b29_walkin`.
 * @param kind - Lifecycle the build determined from the source file suffix.
 * @returns Result of the run.
 */
export function run(name: TName, kind: TCheckKind): ICheckResult {
  const registration: IRegistration = drainRegistration();

  assertKindMatches(name, kind, registration);
  reportBanner(name, kind);

  return kind === "flow" ? runFlow(name, registration) : runCheck(name, registration);
}
