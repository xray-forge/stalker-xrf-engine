export const game_difficulties = {
  gd_novice: "gd_novice",
  gd_stalker: "gd_stalker",
  gd_veteran: "gd_veteran",
  gd_master: "gd_master"
};

export type TGameDifficulties = typeof game_difficulties;

export type TGameDifficulty = TGameDifficulties[keyof TGameDifficulties];

export const game_difficulties_by_number: Record<number, TGameDifficulty> = {
  0: game_difficulties.gd_novice,
  1: game_difficulties.gd_stalker,
  2: game_difficulties.gd_veteran,
  3: game_difficulties.gd_master
};
