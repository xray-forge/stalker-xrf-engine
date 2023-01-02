/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const levels = {
  jupiter: "jupiter",
  jupiter_underground: "jupiter_underground",
  labx8: "labx8",
  pripyat: "pripyat",
  zaton: "zaton"
} as const;

export type TLevels = typeof levels;

export type TLevel = TLevels[keyof TLevels];
