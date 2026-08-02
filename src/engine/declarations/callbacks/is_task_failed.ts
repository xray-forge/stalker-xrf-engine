import { extern, TStringId } from "xray16/lib";

import { taskConfig } from "@/engine/core/managers/tasks";

/** Check whether task with provided ID is failed. */
extern("engine.is_task_failed", (taskId: TStringId): boolean => taskConfig.ACTIVE_TASKS.get(taskId)?.isFailed());
