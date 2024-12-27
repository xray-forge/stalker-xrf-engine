/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * List of available levels.
 */
export const levels = {
  agroprom: "agroprom",
  agroprom_underground: "agroprom_underground",
  darkvalley: "darkvalley",
  escape: "escape",
  garbage: "garbage",
  hospital: "hospital",
  jupiter: "jupiter",
  jupiter_underground: "jupiter_underground",
  labx8: "labx8",
  limansk: "limansk",
  marsh: "marsh",
  military: "military",
  pripyat: "pripyat",
  red_forest: "red_forest",
  stancia_2: "stancia_2",
  yantar: "yantar",
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
