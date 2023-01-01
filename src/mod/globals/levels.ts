/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const levels = {
  jupiter: "jupiter",
  pripyat: "pripyat",
  zaton: "zaton"
} as const;

export type TLevels = typeof levels;

export type TLevel = TLevels[keyof TLevels];
