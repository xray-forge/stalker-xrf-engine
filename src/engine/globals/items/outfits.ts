/* eslint sort-keys-fix/sort-keys-fix: "error" */

export const outfits = {
  cs_heavy_outfit: "cs_heavy_outfit",
  dolg_heavy_outfit: "dolg_heavy_outfit",
  dolg_outfit: "dolg_outfit",
  exo_outfit: "exo_outfit",
  military_outfit: "military_outfit",
  novice_outfit: "novice_outfit",
  scientific_outfit: "scientific_outfit",
  specops_outfit: "specops_outfit",
  stalker_outfit: "stalker_outfit",
  stalker_outfit_barge: "stalker_outfit_barge",
  svoboda_heavy_outfit: "svoboda_heavy_outfit",
  svoboda_light_outfit: "svoboda_light_outfit",
} as const;

export type TOutfits = typeof outfits;

export type TOutfit = TOutfits[keyof TOutfits];
