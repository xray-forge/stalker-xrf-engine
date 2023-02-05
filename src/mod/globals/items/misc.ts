/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const misc = {
  bolt: "bolt",
  device_pda: "device_pda",
  device_torch: "device_torch",
  device_torch_s: "device_torch_s",
  guitar_a: "guitar_a",
  harmonica_a: "harmonica_a",
} as const;

export type TMiscItems = typeof misc;

export type TMiscItem = TMiscItems[keyof TMiscItems];
