/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * Declaration of fonts available for in-game usage.
 */
export const fonts = {
  graffiti19: "graffiti19",
  graffiti22: "graffiti22",
  graffiti32: "graffiti32",
  letterica16: "letterica16",
  letterica18: "letterica18",
} as const;

/**
 * Definition of all possible font config.
 */
export type TFonts = typeof fonts;

/**
 * Signgle possible font type definition.
 */
export type TFontId = keyof TFonts;
