export const fonts = {
  letterica16: "letterica16",
  letterica18: "letterica18",
  graffiti19: "graffiti19",
  graffiti22: "graffiti22",
  graffiti32: "graffiti32"
} as const;

export type TFonts = typeof fonts;

export type TFontId = keyof TFonts;
