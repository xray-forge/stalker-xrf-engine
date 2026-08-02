import { GameObject, GameTask } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { logger } from "./shared";

/**
 * Set one of active actor tasks as current one.
 */
extern("xr_effects.set_active_task", (actor: GameObject, __: GameObject, [taskId]: [Nillable<TStringId>]): void => {
  logger.info("Set active task: %s", taskId);

  const task: Nillable<GameTask> = taskId ? actor.get_task(tostring(taskId), true) : null;

  if (task) {
    actor.set_active_task(task);
  }
});
