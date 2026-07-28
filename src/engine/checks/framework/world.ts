import { game, level } from "xray16";
import { GameObject, ServerObject, Vector } from "xray16/alias";
import { ACTOR_ID, copyVector, Nillable, TCount, TDistance, TLabel, TName, TStringId } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { report } from "@/engine/checks/framework/core";
import { expect } from "@/engine/checks/framework/dsl";
import {
  getManager,
  getPortableStoreValue,
  getServerObjectByStoryId,
  registry,
  setPortableStoreValue,
} from "@/engine/core/database";
import { TaskManager } from "@/engine/core/managers/tasks";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { ETaskState } from "@/engine/core/managers/tasks/types";
import { isObjectOnLevel, teleportActorToPosition, teleportActorToStoryObject } from "@/engine/core/utils/position";

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
 * Record the keys a task currently shows in the log.
 *
 * @param task - Task as returned by {@link settleTask}.
 */
export function reportTaskText(task: Nillable<TaskObject>): void {
  report("task shows '%s' / '%s'", tostring(task?.currentTitle), tostring(task?.currentDescription));
}

/**
 * Settle a task, check the text it shows and record which branches of its condlists won.
 *
 * @param taskId - Task to settle.
 * @param when - What portion state the text is being checked under.
 * @returns The settled task, or null when it is no longer in the log.
 */
export function checkTaskText(taskId: TStringId, when: TLabel): Nillable<TaskObject> {
  const task: Nillable<TaskObject> = settleTask(taskId);

  if ($isNil(task)) {
    report("'%s' is not in the log, so there is no text to check %s", taskId, when);

    return null;
  }

  expectTaskTextResolves(task, taskId, when);
  reportTaskText(task);

  return task;
}

/**
 * Move the actor into a space restrictor, when the level has one registered under that name.
 *
 * @param zoneName - Restrictor name, spelled as the logic spells it.
 * @returns Whether the actor was moved.
 */
export function travelToZone(zoneName: TName): boolean {
  const zone: Nillable<GameObject> = registry.zones.get(zoneName);

  if ($isNil(zone)) {
    report("no restrictor named '%s' is registered, so the actor stays where it is", zoneName);

    return false;
  }

  teleportActorToPosition(zone.position());

  return true;
}

/**
 * Turn the actor's view up at the sky.
 *
 * `set_actor_direction` only turns the yaw, so aiming up means naming a point to look at rather than an angle.
 * The point is nudged forward as well as raised, since one directly overhead leaves the heading undefined.
 *
 * @param height - Metres above the actor to look at.
 */
export function lookActorAtSky(height: TDistance = 100): void {
  const target: Vector = copyVector(registry.actor.position()).add(
    copyVector(registry.actor.direction()).set_length(2)
  );

  target.y += height;

  registry.actor.actor_look_at_point(target);
}

/**
 * Move the actor next to a story object, when there is one on this level to move next to.
 *
 * @param storyId - Story id of the object to arrive next to.
 * @returns Whether the actor was moved.
 */
export function travelToStoryObject(storyId: TStringId): boolean {
  const target: Nillable<ServerObject> = getServerObjectByStoryId(storyId);

  if (!isObjectOnLevel(target, level.name())) {
    return false;
  }

  teleportActorToStoryObject(storyId);

  return true;
}

/**
 * Move the actor to a story object on another level, loading that level to do it.
 *
 * Only worth pointing at something the spawn compiler placed, since the jump goes to the object's own vertices
 * and those are only dependable for an object that has always existed. For a chain that has to cross a level
 * boundary, jump to a fixture and let the on level helpers refine from there.
 *
 * @param storyId - Story id of the object to arrive at.
 * @returns Whether the jump was started.
 */
export function jumpToStoryObject(storyId: TStringId): boolean {
  const target: Nillable<ServerObject> = getServerObjectByStoryId(storyId);

  if ($isNil(target)) {
    report("nothing is registered under story id '%s', so the actor stays where it is", storyId);

    return false;
  }

  report("jumping to '%s', which is not on '%s'", storyId, level.name());
  game.jump_to_level(target!.position, target!.m_level_vertex_id, target!.m_game_vertex_id);

  return true;
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
