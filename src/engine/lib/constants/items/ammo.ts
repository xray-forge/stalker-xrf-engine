/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * todo;
 */
export const ammo = {
  "ammo_11.43x23_fmj": "ammo_11.43x23_fmj",
  "ammo_11.43x23_hydro": "ammo_11.43x23_hydro",
  ammo_12x70_buck: "ammo_12x70_buck",
  ammo_12x76_zhekan: "ammo_12x76_zhekan",
  "ammo_5.45x39_ap": "ammo_5.45x39_ap",
  "ammo_5.45x39_fmj": "ammo_5.45x39_fmj",
  "ammo_5.56x45_ap": "ammo_5.56x45_ap",
  "ammo_5.56x45_ss190": "ammo_5.56x45_ss190",
  "ammo_7.62x54_7h1": "ammo_7.62x54_7h1",
  ammo_9x18_fmj: "ammo_9x18_fmj",
  ammo_9x18_pmm: "ammo_9x18_pmm",
  ammo_9x19_fmj: "ammo_9x19_fmj",
  ammo_9x19_pbp: "ammo_9x19_pbp",
  ammo_9x39_ap: "ammo_9x39_ap",
  ammo_9x39_pab9: "ammo_9x39_pab9",
  ammo_gauss: "ammo_gauss",
  ammo_gauss_cardan: "ammo_gauss_cardan",
  ammo_m209: "ammo_m209",
  "ammo_og-7b": "ammo_og-7b",
  ammo_pkm_100: "ammo_pkm_100",
  "ammo_vog-25": "ammo_vog-25",
} as const;

/**
 * todo;
 */
export type TAmmoItems = typeof ammo;

/**
 * todo;
 */
export type TAmmoItem = TAmmoItems[keyof TAmmoItems];
