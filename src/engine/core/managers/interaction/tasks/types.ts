/**
 * Possible task progression states.
 */
export enum ETaskState {
  NEW = "new",
  // Store as complete to match already existing quests condition lists.
  COMPLETED = "complete",
  FAIL = "fail",
  REVERSED = "reversed",
  UPDATED = "updated",
}

/**
 * Task statuses in game lists.
 */
export enum ETaskStatus {
  NORMAL = 1,
  SELECTED = 2,
}

/**
 * Set of possible task states, where key is state and value is true / null.
 */
export const POSSIBLE_STATES: Record<ETaskState, boolean> = Object.values(ETaskState).reduce((acc, it) => {
  acc[it] = true;

  return acc;
}, {} as Record<ETaskState, boolean>);
