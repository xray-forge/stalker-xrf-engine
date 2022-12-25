/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const fonts = {
  graffiti19: "graffiti19",
  graffiti22: "graffiti22",
  graffiti32: "graffiti32",
  letterica16: "letterica16",
  letterica18: "letterica18"
} as const;

export type TFonts = typeof fonts;

export type TFontId = keyof TFonts;
