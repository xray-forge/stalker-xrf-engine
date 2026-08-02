/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * Patrol path names shared by quest checks.
 *
 * @virtual
 */
export const patrolPaths = {
  zat_b29_actor_base_look: "zat_b29_actor_base_look",
  zat_b29_actor_base_walk: "zat_b29_actor_base_walk",
} as const;

export type TPatrolPaths = typeof patrolPaths;

export type TPatrolPath = TPatrolPaths[keyof TPatrolPaths];
