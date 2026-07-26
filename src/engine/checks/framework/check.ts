import { time_global } from "xray16";
import { Nillable, TLabel, TName, TTimestamp } from "xray16/lib";
import { $isNil } from "xray16/macros";

import {
  CheckContext,
  ensureScriptLoggingEnabled,
  evaluateRequirements,
  ICheckRequirements,
  ICheckResult,
  persistOutcome,
  report,
  reportOutcome,
} from "@/engine/checks/framework/core";

/**
 * Suffix stripped from the source file name when deriving a check name.
 */
const NAME_SUFFIX: TLabel = ".check";

/**
 * Declarative description of a one shot check run.
 *
 * Mirrors a unit test file: `setup` establishes world state once, `body` groups assertions into
 * stages. For a chain that needs play in between steps, use a flow instead.
 */
interface ICheckDefinition {
  requires?: ICheckRequirements;
  setup?: (this: void, context: CheckContext) => void;
  body: (this: void, context: CheckContext) => void;
}

/**
 * Execute a check, report a summary and persist the result.
 *
 * Requirements are evaluated before anything mutates, so a check that cannot run leaves no trace.
 * A failing setup skips the body, since assertions against half built state only mislead.
 *
 * @param dirname - Value of the `$dirname` macro at the call site.
 * @param filename - Value of the `$filename` macro at the call site.
 * @param definition - Lifecycle description of the check.
 * @returns Result of the run.
 */
export function runCheck(dirname: TName, filename: TName, definition: ICheckDefinition): ICheckResult {
  const [name] = string.gsub(`${dirname}_${filename}`, `%${NAME_SUFFIX}$`, "");
  const context: CheckContext = new CheckContext(name);

  ensureScriptLoggingEnabled();
  report("%s: start", name);

  const startedAt: TTimestamp = time_global();
  const skipReason: Nillable<TLabel> = evaluateRequirements(definition.requires);

  if ($isNil(skipReason)) {
    runPhases(context, definition);
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
 * Run setup and body with the failure semantics described on {@link ICheckDefinition}.
 *
 * @param context - Running check context.
 * @param definition - Lifecycle description of the check.
 */
function runPhases(context: CheckContext, definition: ICheckDefinition): void {
  if (definition.setup) {
    const [isCompleted, caught] = pcall(() => definition.setup!(context));

    if (!isCompleted) {
      return context.fail("setup", `aborted, body skipped -> ${tostring(caught)}`);
    }
  }

  const [isCompleted, caught] = pcall(() => definition.body(context));

  if (!isCompleted) {
    context.fail("body", `aborted before completion -> ${tostring(caught)}`);
  }
}
