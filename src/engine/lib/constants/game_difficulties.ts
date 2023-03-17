/* eslint sort-keys-fix/sort-keys-fix: "error"*/

/**
 * todo;
 */
export const game_difficulties = {
  gd_master: "gd_master",
  gd_novice: "gd_novice",
  gd_stalker: "gd_stalker",
  gd_veteran: "gd_veteran",
} as const;

/**
 * todo;
 */
export type TGameDifficulties = typeof game_difficulties;

/**
 * todo;
 */
export type TGameDifficulty = TGameDifficulties[keyof TGameDifficulties];

/**
 * todo;
 */
export const game_difficulties_by_number: Record<number, TGameDifficulty> = {
  0: game_difficulties.gd_novice,
  1: game_difficulties.gd_stalker,
  2: game_difficulties.gd_veteran,
  3: game_difficulties.gd_master,
} as const;
