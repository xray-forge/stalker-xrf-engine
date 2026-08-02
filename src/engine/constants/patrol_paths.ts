/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * Patrol path names shared by quest logic and checks.
 *
 * @virtual
 */
export const patrolPaths = {
  jup_b16_teleport_in: "jup_b16_teleport_in",
  jup_b16_teleport_out: "jup_b16_teleport_out",
  zat_b29_actor_base_look: "zat_b29_actor_base_look",
  zat_b29_actor_base_walk: "zat_b29_actor_base_walk",
} as const;

export type TPatrolPaths = typeof patrolPaths;

export type TPatrolPath = TPatrolPaths[keyof TPatrolPaths];
