import { ACTOR_ID, Nillable, TCount, TLabel, TName, TStringId } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { report } from "@/engine/checks/framework/core";
import { expect } from "@/engine/checks/framework/dsl";
import { getManager, getPortableStoreValue, registry, setPortableStoreValue } from "@/engine/core/database";
import { TaskManager } from "@/engine/core/managers/tasks";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { ETaskState } from "@/engine/core/managers/tasks/types";

/**
 * Force the next evaluation of a task to run instead of being throttled.
 *
 * Task state otherwise advances at most once per `UPDATE_CHECK_PERIOD`, which would make assertions
 * depend on real time.
 *
 * @param taskId - Task whose throttle should be cleared.
 */
function forceTaskEvaluation(taskId: TStringId): void {
  const task: Nillable<TaskObject> = taskConfig.ACTIVE_TASKS.get(taskId);

  if ($isNotNil(task)) {
    task.nextUpdateAt = 0;
  }
}

/**
 * Settle a task against the current portion state and hand back what it settled to.
 *
 * @param taskId - Task to settle.
 * @returns The settled task, or null when it is not in the log.
 */
export function settleTask(taskId: TStringId): Nillable<TaskObject> {
  forceTaskEvaluation(taskId);
  getManager(TaskManager).isTaskCompleted(taskId);

  return taskConfig.ACTIVE_TASKS.get(taskId);
}

/**
 * Settle a task against the current portion state and report the state it reached.
 *
 * @param taskId - Task to evaluate.
 * @returns Settled task state, or null when no condlist branch matched.
 */
export function evaluateTaskState(taskId: TStringId): Nillable<ETaskState> {
  return settleTask(taskId)?.state;
}

/**
 * Assert the text a task shows in the log resolved to something.
 *
 * @param task - Task as returned by {@link settleTask}.
 * @param taskId - Task id, for the failure detail.
 * @param when - What portion state the text is being checked under.
 */
export function expectTaskTextResolves(task: Nillable<TaskObject>, taskId: TStringId, when: TLabel): void {
  const absent: TLabel = `'${taskId}' is not in the log`;

  expect(
    $isNotNil(task?.currentTitle),
    `title resolves ${when}`,
    $isNil(task) ? absent : `'${taskId}' title condlist matched nothing`
  );
  expect(
    $isNotNil(task?.currentDescription),
    `description resolves ${when}`,
    $isNil(task) ? absent : `'${taskId}' description condlist matched nothing`
  );

  if ($isNotNil(task?.currentTitle) && task?.currentTitle === task?.currentDescription) {
    report(
      "'%s' description is the same string as its title ('%s'), which is what a '_name' key in a descr slot looks like",
      taskId,
      tostring(task?.currentTitle)
    );
  }
}

/**
 * Record what the actor is carrying, so a payout observed on a later invocation can be a delta.
 *
 * @param key - Actor store key to record under.
 */
export function rememberActorMoney(key: TName): void {
  setPortableStoreValue<TCount>(ACTOR_ID, key, registry.actor.money());
}

/**
 * Assert the actor is at least a given amount better off than when the baseline was recorded.
 *
 * @param key - Actor store key the baseline was recorded under.
 * @param atLeast - Money the payout is expected to be worth.
 * @param assertion - Short label of what was being verified.
 */
export function expectActorMoneyGained(key: TName, atLeast: TCount, assertion: TLabel): void {
  const before: TCount = getPortableStoreValue<TCount>(ACTOR_ID, key, -1);

  if (before < 0) {
    return report("no money baseline under '%s', the payout happened outside this walk", key);
  }

  const gained: TCount = registry.actor.money() - before;

  expect(
    gained >= atLeast,
    assertion,
    `actor is ${gained} better off since the baseline, expected at least ${atLeast}`
  );
}
