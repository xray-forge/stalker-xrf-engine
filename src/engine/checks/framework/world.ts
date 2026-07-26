import { ServerObject } from "xray16/alias";
import { AnyCallablesModule, assert, getExtern, Nillable, TName, TStringId } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { report } from "@/engine/checks/framework/core";
import { TInfoPortion } from "@/engine/constants/info_portions";
import { getManager, getServerObjectByStoryId, registry } from "@/engine/core/database";
import { TaskManager } from "@/engine/core/managers/tasks";
import { taskConfig } from "@/engine/core/managers/tasks/TaskConfig";
import { TaskObject } from "@/engine/core/managers/tasks/TaskObject";
import { disableInfoPortion, giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Give the actor a task, discarding any previous instance of it.
 *
 * `giveTask` builds a fresh task object every call, resetting its evaluated state, which is what
 * lets a check reach the same conclusion on a save it has already run against.
 *
 * Guarded because giving a task fires the notification callback, and a title functor yielding nil
 * aborts in there, three layers from the cause.
 *
 * @param taskId - Task to give.
 */
export function giveFreshTask(taskId: TStringId): void {
  const [isCompleted, caught] = pcall(() => getManager(TaskManager).giveTask(taskId));

  if (!isCompleted) {
    report("giveFreshTask('%s') failed -> %s", taskId, tostring(caught));
  }
}

/**
 * Force the next evaluation of a task to run instead of being throttled.
 *
 * Task state otherwise advances at most once per `UPDATE_CHECK_PERIOD`, which would make assertions
 * depend on real time.
 *
 * @param taskId - Task whose throttle should be cleared.
 */
export function forceTaskEvaluation(taskId: TStringId): void {
  const task: Nillable<TaskObject> = taskConfig.ACTIVE_TASKS.get(taskId);

  if ($isNotNil(task)) {
    task.nextUpdateAt = 0;
  }
}

/**
 * Set an info portion to an absolute presence, rather than toggling it.
 *
 * Preconditions have to be absolute, so a run does not depend on what a previous one left behind.
 *
 * @param infoPortion - Info portion to set.
 * @param isPresent - Whether the portion should be present afterwards.
 */
export function setInfoPortion(infoPortion: TInfoPortion, isPresent: boolean): void {
  if (isPresent) {
    if (!hasInfoPortion(infoPortion)) {
      giveInfoPortion(infoPortion);
    }
  } else if (hasInfoPortion(infoPortion)) {
    disableInfoPortion(infoPortion);
  }
}

/**
 * Move the actor to a patrol path, the way quest configs do it. Aborts on an unknown path.
 *
 * @param positionPatrolName - Patrol path whose first point the actor is moved to.
 * @param lookPatrolName - Optional patrol path the actor is turned to face.
 */
export function teleportActorToPatrol(positionPatrolName: TName, lookPatrolName: Nillable<TName> = null): void {
  getExtern<AnyCallablesModule>("xr_effects").teleport_actor(null, null, [positionPatrolName, lookPatrolName]);
}

/**
 * Move the actor to whoever or whatever carries a story id. Aborts on an unregistered id.
 *
 * Resolves the server object, so it works whether or not the target is currently online.
 *
 * @param storyId - Story id of the object to arrive at.
 */
export function teleportActorToStoryObject(storyId: TStringId): void {
  const serverObject: Nillable<ServerObject> = getServerObjectByStoryId(storyId);

  assert($isNotNil(serverObject), "Cannot teleport, no object with story id '%s' is registered.", storyId);

  registry.actor.set_actor_position(serverObject!.position);
}
