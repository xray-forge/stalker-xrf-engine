import { time_global } from "xray16";
import { Nillable, TLabel, TName, TTimestamp } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import {
  CheckContext,
  ensureScriptLoggingEnabled,
  evaluateRequirements,
  ICheckResult,
  persistOutcome,
  report,
  reportOutcome,
} from "@/engine/checks/framework/core";
import { clearCurrentContext, IRegistration, setCurrentContext } from "@/engine/checks/framework/dsl";

/**
 * Execute a check, report a summary and persist the result.
 *
 * Requirements are evaluated before anything mutates, so a check that cannot run leaves no trace.
 *
 * @param name - Check name, single sourced from the generated launcher.
 * @param registration - What the check source file declared while it was required.
 * @returns Result of the run.
 */
export function runCheck(name: TName, registration: IRegistration): ICheckResult {
  const context: CheckContext = new CheckContext(name);

  ensureScriptLoggingEnabled();
  report("%s: start", name);

  const startedAt: TTimestamp = time_global();
  const skipReason: Nillable<TLabel> = evaluateRequirements(registration.requirements);

  if ($isNil(skipReason)) {
    // Bracketed rather than left set: a stray assertion after this run should abort loudly instead
    // of being recorded against a result nobody is going to read.
    setCurrentContext(context);

    const [isCompleted, caught] = pcall(() => runStages(context, registration));

    clearCurrentContext();

    if (!isCompleted) {
      context.fail("check", `aborted before completion -> ${tostring(caught)}`);
    }
  }

  const result: ICheckResult = {
    name: name,
    stages: context.stages,
    checked: context.checked,
    failures: context.failures,
    skipReason: skipReason,
  };

  reportOutcome(result, result.failures.length() === 0 ? "PASS" : "FAIL", time_global() - startedAt);
  persistOutcome(result);

  return result;
}

/**
 * Run the setup hook, then every stage the file registered.
 *
 * A failing `beforeAll` skips every stage, since assertions against half built state only mislead.
 * Stages are individually isolated, so one abort does not hide the ones after it.
 *
 * @param context - Running check context.
 * @param registration - What the check source file declared.
 */
function runStages(context: CheckContext, registration: IRegistration): void {
  if ($isNotNil(registration.beforeAll)) {
    const [isCompleted, caught] = pcall(() => registration.beforeAll!());

    if (!isCompleted) {
      return context.fail("beforeAll", `aborted, every stage skipped -> ${tostring(caught)}`);
    }
  }

  for (const [, stage] of registration.stages) {
    context.stage(stage.name, stage.body);
  }
}
