import { time_global } from "xray16";
import { ACTOR_ID, LuaArray, Nillable, TCount, TIndex, TLabel, TName } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import {
  CheckContext,
  ensureScriptLoggingEnabled,
  evaluateRequirements,
  evaluateStateRequirements,
  ICheckResult,
  notify,
  persistOutcome,
  report,
  reportOutcome,
} from "@/engine/checks/framework/core";
import { clearCurrentContext, IFlowStep, IRegistration, setCurrentContext } from "@/engine/checks/framework/dsl";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database";

/**
 * Prefix of the actor portable store key a flow keeps its progress under.
 *
 * `ActorBinder.save` writes that store into the save packet, so progress travels with the save. That is
 * also the only way to rewind a flow: load a save from before the walk. Nothing here undoes world state,
 * because most of what a chain does - money, items, faction standing, spawned squads - cannot be undone,
 * and flipping the portions back while leaving all of that produces a state the game never produces.
 */
const CURSOR_KEY_PREFIX: TName = "xrf_flow_";

/**
 * @param name - Flow name.
 * @returns Actor portable store key holding how far this flow has been confirmed.
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
 * Each invocation gets its own context, so without a persisted tally the last one - which confirms the
 * final step and nothing else - would report a clean pass over a walk that failed earlier.
 *
 * @param name - Flow name.
 * @returns Failures recorded since the walk began.
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
 * Read how many steps of a flow have been confirmed.
 *
 * @param name - Flow name.
 * @returns Position of the last confirmed step, 0 when nothing has been.
 */
function readCursor(name: TName): TIndex {
  return getPortableStoreValue<TIndex>(ACTOR_ID, resolveCursorKey(name), 0);
}

/**
 * Record how many steps of a flow have been confirmed.
 *
 * @param name - Flow name.
 * @param position - Position to store.
 */
function writeCursor(name: TName, position: TIndex): void {
  setPortableStoreValue<TIndex>(ACTOR_ID, resolveCursorKey(name), position);
}

/**
 * Ask a step whether the world has reached it.
 *
 * A predicate that aborts is treated as not reached and recorded as a failure: the flow should stop
 * where it can no longer tell, rather than walk on past a step it never actually observed.
 *
 * @param context - Running flow context.
 * @param step - Step to test.
 * @param position - Position of the step, for failure reporting.
 * @returns Whether the step's outcome exists in the world.
 */
function isStepReached(context: CheckContext, step: IFlowStep, position: TIndex): boolean {
  const [isCompleted, caught] = pcall(() => step.reached());

  if (!isCompleted) {
    context.fail(`step ${position} reached`, `could not be evaluated -> ${tostring(caught)}`);

    return false;
  }

  return caught === true;
}

/**
 * Verify a step that has been reached, in isolation from the rest of the walk.
 *
 * @param context - Running flow context.
 * @param step - Step to verify.
 * @param position - Position of the step, for failure reporting.
 */
function verifyStep(context: CheckContext, step: IFlowStep, position: TIndex): void {
  if ($isNil(step.verify)) {
    return;
  }

  context.stages += 1;

  const [isCompleted, caught] = pcall(() => step.verify!());

  if (!isCompleted) {
    context.fail(`step ${position} verify`, `aborted -> ${tostring(caught)}`);
  }
}

/**
 * Walk forward over everything the world has already reached, and report where it stops.
 *
 * This is the whole lifecycle. Every invocation re-observes from the last confirmed step, so progress
 * made in play counts identically to progress made across earlier invocations - and a step reached
 * naturally is still verified, which is the point of watching rather than driving.
 *
 * @param context - Running flow context.
 * @param steps - Steps the flow registered.
 * @param name - Flow name.
 * @returns Headline verdict of this invocation.
 */
function observe(context: CheckContext, steps: LuaArray<IFlowStep>, name: TName): TLabel {
  const total: TCount = steps.length();

  if (total === 0) {
    context.fail("flow", "declares no steps");

    return "FAIL";
  }

  let confirmed: TIndex = readCursor(name);

  if (confirmed >= total) {
    report("%s: already complete, load a save from before the walk to observe it again", name);
    notify(`${name} is already complete - load an earlier save to watch it again`);

    return "COMPLETE";
  }

  for (const position of $range(confirmed + 1, total)) {
    const step: IFlowStep = steps.get(position);

    if ($isNotNil(step.travel)) {
      const [isCompleted, caught] = pcall(() => step.travel!());

      if (!isCompleted) {
        context.fail(`step ${position} travel`, `aborted -> ${tostring(caught)}`);
      }
    }

    if (!isStepReached(context, step, position)) {
      report("%s: step %s/%s '%s' not reached yet", name, position, total, step.name);

      if ($isNotNil(step.handOff)) {
        report("%s: to reach it -> %s", name, step.handOff);
      }

      notify(
        $isNotNil(step.handOff)
          ? `${position}/${total} ${step.name} - to reach it: ${step.handOff}`
          : `${position}/${total} ${step.name} - not reached yet`
      );

      return "WAITING";
    }

    verifyStep(context, step, position);
    writeCursor(name, position);

    confirmed = position;
    report("%s: step %s/%s '%s' reached", name, position, total, step.name);
  }

  const walkFailures: TCount = readFailures(name) + context.failures.length();

  report("%s: last step reached, flow complete", name);
  notify(
    walkFailures === 0
      ? `${name} complete: ${total}/${total} steps, no failures`
      : `${name} complete: ${total}/${total} steps, ${walkFailures} failure(s) during the walk`
  );

  return "COMPLETE";
}

/**
 * Execute one invocation of a flow: observe how far the chain has got, and verify it.
 *
 * @param name - Flow name, single sourced from the generated launcher.
 * @param registration - What the flow source file declared while it was required.
 * @returns Result of the invocation.
 */
export function runFlow(name: TName, registration: IRegistration): ICheckResult {
  const context: CheckContext = new CheckContext(name);

  ensureScriptLoggingEnabled();
  report("%s: flow start", name);

  const startedAt: TCount = time_global();
  const skipReason: Nillable<TLabel> = evaluateRequirements(registration.requirements);
  const blockers: LuaArray<TLabel> = $isNil(skipReason)
    ? evaluateStateRequirements(registration.requirements)
    : new LuaTable();

  let verdict: TLabel = "SKIP";

  if ($isNotNil(skipReason)) {
    verdict = "SKIP";
  } else if (blockers.length() > 0) {
    // Blocked rather than forced. The chain has to be brought here by playing it or by walking the flow
    // that produces this state, because there is no honest way to fake a mid chain world.
    verdict = "BLOCKED";

    for (const [, blocker] of blockers) {
      report("%s: blocked - %s", name, blocker);
    }

    notify(`${name} blocked: ${blockers.get(1)}`);
  } else {
    // Bracketed rather than left set: a stray assertion after this invocation should abort loudly
    // instead of being recorded against a result nobody is going to read.
    setCurrentContext(context);

    const [isCompleted, caught] = pcall(() => {
      verdict = observe(context, registration.steps, name);
    });

    clearCurrentContext();

    if (!isCompleted) {
      context.fail("flow", `aborted -> ${tostring(caught)}`);
      verdict = "FAIL";
    }
  }

  const result: ICheckResult = {
    name: name,
    stages: context.stages,
    checked: context.checked,
    failures: context.failures,
    skipReason: skipReason,
  };

  const failures: TCount = result.failures.length();
  const isObserving: boolean = $isNil(skipReason) && blockers.length() === 0;

  // The tally spans the whole walk, so a clean final invocation cannot pass off an earlier failure.
  const walkFailures: TCount = isObserving ? readFailures(name) + failures : readFailures(name);

  if (isObserving) {
    writeFailures(name, walkFailures);
  }

  // A failing assertion outranks the progression verdict: the chain got here, but something is broken.
  // Completing a walk that failed anywhere is a failure too, however clean the last invocation was.
  let outcome: TLabel = failures === 0 ? verdict : "FAIL";

  if (outcome === "COMPLETE" && walkFailures > 0) {
    outcome = "FAIL";
  }

  const extra: LuaArray<string> = new LuaTable();

  table.insert(extra, `kind=flow`);
  table.insert(extra, `state=${string.lower(outcome)}`);
  table.insert(extra, `confirmed=${readCursor(name)}`);
  table.insert(extra, `total=${registration.steps.length()}`);
  table.insert(extra, `failedWalk=${walkFailures}`);

  for (const [, blocker] of blockers) {
    table.insert(extra, `blocked\t${blocker}`);
  }

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
