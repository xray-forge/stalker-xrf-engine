/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const treasures = {
  jup_hiding_place_40: "jup_hiding_place_40"
} as const;

export type TTreasures = typeof treasures;

export type TTreasure = TTreasures[keyof TTreasures];
