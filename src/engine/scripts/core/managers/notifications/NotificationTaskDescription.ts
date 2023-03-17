import { ETaskState } from "@/engine/scripts/core/managers/tasks/ETaskState";

/**
 * todo;
 */
export const notificationTaskDescription = {
  [ETaskState.NEW]: "general_new_task",
  [ETaskState.COMPLETE]: "general_complete_task",
  [ETaskState.FAIL]: "general_fail_task",
  [ETaskState.REVERSED]: "general_reverse_task",
  [ETaskState.UPDATED]: "general_update_task",
};

/**
 * todo;
 */
export type TNotificationTaskDescriptions = typeof notificationTaskDescription;

/**
 * todo;
 */
export type TNotificationTaskDescriptionKey = keyof TNotificationTaskDescriptions;

/**
 * todo;
 */
export type TNotificationTaskDescription = TNotificationTaskDescriptions[TNotificationTaskDescriptionKey];
