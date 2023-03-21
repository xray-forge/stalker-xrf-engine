/* eslint sort-keys-fix/sort-keys-fix: "error" */

import { TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export const gameDifficulties = {
  gd_master: "gd_master",
  gd_novice: "gd_novice",
  gd_stalker: "gd_stalker",
  gd_veteran: "gd_veteran",
} as const;

/**
 * todo;
 */
export type TGameDifficulties = typeof gameDifficulties;

/**
 * todo;
 */
export type TGameDifficulty = TGameDifficulties[keyof TGameDifficulties];

/**
 * todo;
 */
export const gameDifficultiesByNumber: Record<TNumberId, TGameDifficulty> = {
  0: gameDifficulties.gd_novice,
  1: gameDifficulties.gd_stalker,
  2: gameDifficulties.gd_veteran,
  3: gameDifficulties.gd_master,
} as const;
