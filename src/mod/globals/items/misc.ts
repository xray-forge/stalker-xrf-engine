/* eslint sort-keys-fix/sort-keys-fix: "error"*/

import { weapons } from "@/mod/globals/items/weapons";

export const misc = {
  bolt: "bolt",
  device_pda: "device_pda",
  guitar_a: "guitar_a",
  harmonica_a: "harmonica_a",
  wpn_binoc: weapons.wpn_binoc
} as const;

export type TMiscItems = typeof misc;

export type TMiscItem = TMiscItems[keyof TMiscItems];
