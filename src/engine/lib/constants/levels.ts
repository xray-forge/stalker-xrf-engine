/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * todo;
 */
export const levels = {
  jupiter: "jupiter",
  jupiter_underground: "jupiter_underground",
  labx8: "labx8",
  pripyat: "pripyat",
  zaton: "zaton",
} as const;

/**
 * todo;
 */
export type TLevels = typeof levels;

/**
 * todo;
 */
export type TLevel = TLevels[keyof TLevels];
