import { Nillable, TStringId } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { report } from "@/engine/checks/framework/core";
import { TInfoPortion } from "@/engine/constants/info_portions";
import { getManager } from "@/engine/core/database";
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
