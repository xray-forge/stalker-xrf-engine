import { GameObject } from "xray16/alias";
import { assert, extern, Nillable, TStringId } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { TaskManager } from "@/engine/core/managers/tasks";

/**
 * Give new task for actor.
 */
extern("xr_effects.give_task", (_: GameObject, __: GameObject, [taskId]: [Nillable<TStringId>]): void => {
  assert(taskId, "No task id parameter in give_task effect.");
  getManager(TaskManager).giveTask(taskId);
});
