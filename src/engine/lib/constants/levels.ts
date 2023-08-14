/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * List of available levels.
 */
export const levels = {
  jupiter: "jupiter",
  jupiter_underground: "jupiter_underground",
  labx8: "labx8",
  pripyat: "pripyat",
  zaton: "zaton",
} as const;

/**
 * Type definition of available levels list.
 */
export type TLevels = typeof levels;

/**
 * Game level type definition.
 */
export type TLevel = TLevels[keyof TLevels];
