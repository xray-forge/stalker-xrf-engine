/* eslint sort-keys-fix/sort-keys-fix: "error" */

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
 * Enum with number representation of game difficulties.
 */
export enum EGameDifficulty {
  NOVICE = 0,
  STALKER = 1,
  VETERAN = 2,
  MASTER = 3,
}

/**
 * Mapping game difficulties with number-string pairs.
 */
export const gameDifficultiesByNumber: Record<EGameDifficulty, TGameDifficulty> = {
  [EGameDifficulty.NOVICE]: gameDifficulties.gd_novice,
  [EGameDifficulty.STALKER]: gameDifficulties.gd_stalker,
  [EGameDifficulty.VETERAN]: gameDifficulties.gd_veteran,
  [EGameDifficulty.MASTER]: gameDifficulties.gd_master,
} as const;
