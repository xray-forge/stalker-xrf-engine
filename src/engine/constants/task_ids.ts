/**
 * Task identifiers referenced by engine code outside their task configuration.
 *
 * @virtual
 */
export const taskIds = {
  hide_from_surge: "hide_from_surge",
} as const;

export type TTaskIds = typeof taskIds;

export type TTaskId = TTaskIds[keyof TTaskIds];
