/**
 * Task identifiers referenced by engine code outside their task configuration.
 *
 * @virtual
 */
export const taskIds = {
  hide_from_surge: "hide_from_surge",
  zat_b14_learn_about_strange_occurrence: "zat_b14_learn_about_strange_occurrence",
  zat_b14_learn_about_strange_occurrence_by_stalkers: "zat_b14_learn_about_strange_occurrence_by_stalkers",
  zat_b33_zaporojec: "zat_b33_zaporojec",
  zat_b52_reputation: "zat_b52_reputation",
} as const;

export type TTaskIds = typeof taskIds;

export type TTaskId = TTaskIds[keyof TTaskIds];
