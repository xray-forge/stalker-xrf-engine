/* eslint sort-keys-fix/sort-keys-fix: "error" */

export const misc = {
  bolt: "bolt",
  device_pda: "device_pda",
  device_torch: "device_torch",
  guitar_a: "guitar_a",
  hand_radio: "hand_radio",
  hand_radio_r: "hand_radio_r",
  harmonica_a: "harmonica_a",
  medkit_script: "medkit_script",
  toolkit_1: "toolkit_1",
  toolkit_2: "toolkit_2",
  toolkit_3: "toolkit_3",
} as const;

export type TMiscItems = typeof misc;

export type TMiscItem = TMiscItems[keyof TMiscItems];
