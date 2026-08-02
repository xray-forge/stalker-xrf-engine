import { extern, TStringId } from "xray16/lib";

import { taskConfig } from "@/engine/core/managers/tasks";

/** Check whether task with provided ID is completed. */
extern("engine.is_task_completed", (taskId: TStringId): boolean => taskConfig.ACTIVE_TASKS.get(taskId)?.isCompleted());
