import { time_global } from "xray16";
import { ACTOR_ID, LuaArray, Nillable, TCount, TIndex, TLabel, TName } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import {
  CheckContext,
  ensureScriptLoggingEnabled,
  evaluateRequirements,
  ICheckRequirements,
  ICheckResult,
  notify,
  persistOutcome,
  report,
  reportOutcome,
} from "@/engine/checks/framework/core";
import { getPortableStoreValue, registry, setPortableStoreValue } from "@/engine/core/database";

/**
 * Suffix stripped from the source file name when deriving a flow name.
 */
const NAME_SUFFIX: TLabel = ".flow";

/**
 * Prefix of the actor portable store key a flow keeps its cursor under.
 *
 * `ActorBinder` writes that store into the save packet, so the cursor survives save, load and
 * restarts, and it travels with the save: loading an earlier save rewinds the flow with it.
 */
const CURSOR_KEY_PREFIX: TName = "xrf_flow_";

/**
 * One step of a flow.
 */
interface IFlowStep {
  /** What this step establishes, echoed to the console when the step is armed. */
  name: TLabel;
  /** Mutations putting the world into the state this step needs. */
  arrange?: (this: void, context: CheckContext) => void;
  /** Assertions that must hold immediately after `arrange`. */
  verify?: (this: void, context: CheckContext) => void;
  /** What the operator is expected to do while this step is armed. */
  handOff?: TLabel;
  /**
   * What should be true by the time the flow leaves this step. Asserted on the way out, never
   * awaited: the next invocation advances either way, and an unmet gate is reported as a failure.
   */
  advanceWhen?: (this: void) => boolean;
}

/**
 * Declarative description of a resumable flow.
 */
interface IFlowDefinition {
  requires?: ICheckRequirements;
  steps: Array<IFlowStep>;
}

/**
 * Derive the flow name from the source location of the caller.
 *
 * @param dirname - Value of the `$dirname` macro at the call site.
 * @param filename - Value of the `$filename` macro at the call site.
 * @returns Name the flow reports and stores its cursor under.
 */
function resolveName(dirname: TName, filename: TName): TName {
  const [name] = string.gsub(`${dirname}_${filename}`, `%${NAME_SUFFIX}$`, "");

  return name;
}

/**
 * @param name - Flow name.
 * @returns Actor portable store key holding the cursor of this flow.
 */
function resolveCursorKey(name: TName): TName {
  return `${CURSOR_KEY_PREFIX}${name}`;
}

/**
 * @param name - Flow name.
 * @returns Actor portable store key holding the failure tally of this walk.
 */
function resolveFailuresKey(name: TName): TName {
  return `${CURSOR_KEY_PREFIX}${name}_failures`;
}

/**
 * Read how many assertions have failed so far during this walk.
 *
 * Each invocation gets its own context, so without a persisted tally the last one - which arms
 * nothing and asserts nothing - would report a clean pass over a walk that failed earlier.
 *
 * @param name - Flow name.
 * @returns Failures recorded since the flow was last reset.
 */
function readFailures(name: TName): TCount {
  return getPortableStoreValue<TCount>(ACTOR_ID, resolveFailuresKey(name), 0);
}

/**
 * Record the running failure tally of this walk.
 *
 * @param name - Flow name.
 * @param count - Total to store.
 */
function writeFailures(name: TName, count: TCount): void {
  setPortableStoreValue<TCount>(ACTOR_ID, resolveFailuresKey(name), count);
}

/**
 * Read the cursor of a flow.
 *
 * @param name - Flow name.
 * @returns Position of the armed step, 0 when the flow has not started.
 */
function readCursor(name: TName): TIndex {
  return getPortableStoreValue<TIndex>(ACTOR_ID, resolveCursorKey(name), 0);
}

/**
 * Move the cursor of a flow.
 *
 * @param name - Flow name.
 * @param position - Position to store.
 */
function writeCursor(name: TName, position: TIndex): void {
  setPortableStoreValue<TIndex>(ACTOR_ID, resolveCursorKey(name), position);
}

/**
 * @param definition - Flow being run.
 * @param position - One based step position.
 * @returns Step at that position.
 */
function resolveStep(definition: IFlowDefinition, position: TIndex): IFlowStep {
  return definition.steps[position - 1];
}

/**
 * Assert the expected outcome of a step on the way out of it.
 *
 * An unmet gate is a finding either way: the hand off was not done yet, or doing it failed to
 * produce the state the configs promise.
 *
 * @param context - Running flow context.
 * @param step - Step being left.
 * @param position - Position of the step, for failure reporting.
 */
function assertStepOutcome(context: CheckContext, step: IFlowStep, position: TIndex): void {
  if ($isNil(step.advanceWhen)) {
    return;
  }

  const [isCompleted, caught] = pcall(() => step.advanceWhen!());

  if (!isCompleted) {
    return context.fail(`step ${position} gate`, `could not be evaluated -> ${tostring(caught)}`);
  }

  context.expect(
    caught === true,
    `step ${position} outcome`,
    $isNotNil(step.handOff)
      ? `advanced before '${step.handOff}' was satisfied, later steps may fail as a result`
      : `advanced before the expected outcome of step ${position} was reached`
  );
}

/**
 * Arm a step: establish its state, verify what must hold straight after, and move the cursor.
 *
 * The cursor moves only once `arrange` has completed, so a step that aborts mid setup is retried
 * rather than skipped past a half built world.
 *
 * @param context - Running flow context.
 * @param definition - Flow being run.
 * @param name - Flow name.
 * @param position - Position of the step to arm.
 * @returns Whether the step was armed.
 */
function armStep(context: CheckContext, definition: IFlowDefinition, name: TName, position: TIndex): boolean {
  const step: IFlowStep = resolveStep(definition, position);

  context.stages += 1;

  if ($isNotNil(step.arrange)) {
    const [isCompleted, caught] = pcall(() => step.arrange!(context));

    if (!isCompleted) {
      context.fail(`step ${position} arrange`, `aborted, cursor left in place -> ${tostring(caught)}`);

      return false;
    }
  }

  writeCursor(name, position);
  report("%s: step %s/%s '%s' armed", name, position, definition.steps.length, step.name);

  if ($isNotNil(step.verify)) {
    const [isCompleted, caught] = pcall(() => step.verify!(context));

    if (!isCompleted) {
      context.fail(`step ${position} verify`, `aborted -> ${tostring(caught)}`);
    }
  }

  if ($isNotNil(step.handOff)) {
    report("%s: next -> %s", name, step.handOff);
  }

  // One tip per invocation rather than one per line: the queue would otherwise show the step label
  // and its hand off as two hints competing for the same corner of the screen.
  notify(
    $isNotNil(step.handOff)
      ? `${position}/${definition.steps.length} ${step.name} - next: ${step.handOff}`
      : `${position}/${definition.steps.length} ${step.name}`
  );

  return true;
}

/**
 * Advance the flow by exactly one step and describe what happened.
 *
 * Every invocation moves forward, so a flow is walked by repeating one console command.
 *
 * @param context - Running flow context.
 * @param definition - Flow being run.
 * @param name - Flow name.
 * @returns Headline verdict of this invocation.
 */
function advance(context: CheckContext, definition: IFlowDefinition, name: TName): TLabel {
  const total: TCount = definition.steps.length;
  const cursor: TIndex = readCursor(name);

  if (total === 0) {
    context.fail("flow", "declares no steps");

    return "FAIL";
  }

  // Past the last step: the flow is done and stays done until it is reset.
  if (cursor > total) {
    report("%s: already complete, reset with 'run_script flow_%s_reset' to walk it again", name, name);
    notify(`${name} is already complete - reset it to walk again`);

    return "COMPLETE";
  }

  if (cursor === 0) {
    // Starting over: the previous walk's tally must not leak into this one.
    writeFailures(name, 0);

    return armStep(context, definition, name, 1) ? "ARMED" : "FAIL";
  }

  const current: IFlowStep = resolveStep(definition, cursor);

  assertStepOutcome(context, current, cursor);
  report("%s: step %s/%s '%s' done", name, cursor, total, current.name);

  if (cursor === total) {
    const walkFailures: TCount = readFailures(name) + context.failures.length();

    writeCursor(name, total + 1);
    report("%s: last step reached, flow complete", name);
    notify(
      walkFailures === 0
        ? `${name} complete: ${total}/${total} steps, no failures`
        : `${name} complete: ${total}/${total} steps, ${walkFailures} failure(s) during the walk`
    );

    return "COMPLETE";
  }

  return armStep(context, definition, name, cursor + 1) ? "ARMED" : "FAIL";
}

/**
 * Execute one invocation of a flow: advance one step, report and persist the result.
 *
 * @param dirname - Value of the `$dirname` macro at the call site.
 * @param filename - Value of the `$filename` macro at the call site.
 * @param definition - Step description of the flow.
 * @returns Result of the invocation.
 */
export function runFlow(dirname: TName, filename: TName, definition: IFlowDefinition): ICheckResult {
  const name: TName = resolveName(dirname, filename);
  const context: CheckContext = new CheckContext(name);

  ensureScriptLoggingEnabled();
  report("%s: flow start", name);

  const startedAt: TCount = time_global();
  const skipReason: Nillable<TLabel> = evaluateRequirements(definition.requires);
  let verdict: TLabel = "SKIP";

  if ($isNil(skipReason)) {
    verdict = advance(context, definition, name);
  }

  const result: ICheckResult = {
    name: name,
    stages: context.stages,
    checked: context.checked,
    failures: context.failures,
    skipReason: skipReason,
  };

  const failures: TCount = result.failures.length();

  // The tally spans the whole walk, so a clean final invocation cannot pass off an earlier failure.
  const walkFailures: TCount = $isNotNil(skipReason) ? readFailures(name) : readFailures(name) + failures;

  if ($isNil(skipReason)) {
    writeFailures(name, walkFailures);
  }

  // A failing assertion outranks the progression verdict: the step moved, but something is broken.
  // Completing a walk that failed anywhere is a failure too, however clean the last invocation was.
  let outcome: TLabel = failures === 0 ? verdict : "FAIL";

  if (outcome === "COMPLETE" && walkFailures > 0) {
    outcome = "FAIL";
  }

  const extra: LuaArray<string> = new LuaTable();

  table.insert(extra, `kind=flow`);
  table.insert(extra, `state=${string.lower(outcome)}`);
  table.insert(extra, `step=${readCursor(name)}`);
  table.insert(extra, `total=${definition.steps.length}`);
  table.insert(extra, `failedWalk=${walkFailures}`);

  reportOutcome(result, outcome, time_global() - startedAt);

  if (walkFailures > failures) {
    report("%s: %s failure(s) so far in this walk", name, walkFailures);
  }

  persistOutcome(result, extra);

  // A run that could not proceed, or one that found something, must not be discoverable only by
  // opening the console: the operator is looking at the game, not at the log.
  if ($isNotNil(skipReason)) {
    notify(`${name} skipped: ${skipReason}`);
  } else if (outcome === "FAIL") {
    notify(`${name} FAILED: ${failures} problem(s) here, ${walkFailures} in this walk`);
  }

  return result;
}

/**
 * Send a flow back to its first step.
 *
 * Clears the cursor only. World state a previous walk established is left alone, since every step
 * arranges its own preconditions on the way through.
 *
 * @param dirname - Value of the `$dirname` macro at the call site.
 * @param filename - Value of the `$filename` macro at the call site.
 */
export function resetFlow(dirname: TName, filename: TName): void {
  const name: TName = resolveName(dirname, filename);

  ensureScriptLoggingEnabled();

  if ($isNil(registry.actor)) {
    return report("%s: cannot reset, actor is not registered", name);
  }

  writeCursor(name, 0);
  writeFailures(name, 0);
  report("%s: flow reset, next run arms step 1", name);
  notify(`${name} reset - next run arms step 1`);
}
