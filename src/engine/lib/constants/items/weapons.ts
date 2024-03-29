/* eslint sort-keys-fix/sort-keys-fix: "error" */

import type { TName } from "@/engine/lib/types";

/**
 * List of available pistol sections.
 */
export const pistols = {
  wpn_beretta: "wpn_beretta",
  wpn_colt1911: "wpn_colt1911",
  wpn_desert_eagle: "wpn_desert_eagle",
  wpn_fort: "wpn_fort",
  wpn_hpsa: "wpn_hpsa",
  wpn_pb: "wpn_pb",
  wpn_pm: "wpn_pm",
  wpn_usp: "wpn_usp",
  wpn_walther: "wpn_walther",
} as const;

/**
 * List of all game weapon sections available.
 */
export const weapons = {
  ...pistols,
  grenade_f1: "grenade_f1",
  grenade_rgd5: "grenade_rgd5",
  wpn_abakan: "wpn_abakan",
  wpn_ak74: "wpn_ak74",
  wpn_ak74u: "wpn_ak74u",
  wpn_ak74u_snag: "wpn_ak74u_snag",
  wpn_ammo: "wpn_ammo",
  wpn_ammo_m209: "wpn_ammo_m209",
  wpn_ammo_og7b: "wpn_ammo_og7b",
  wpn_ammo_vog25: "wpn_ammo_vog25",
  wpn_binoc: "wpn_binoc",
  wpn_binocular: "wpn_binocular",
  wpn_bm16: "wpn_bm16",
  wpn_desert_eagle_nimble: "wpn_desert_eagle_nimble",
  wpn_fn2000: "wpn_fn2000",
  wpn_fn2000_nimble: "wpn_fn2000_nimble",
  wpn_fort_snag: "wpn_fort_snag",
  wpn_g36: "wpn_g36",
  wpn_g36_nimble: "wpn_g36_nimble",
  wpn_gauss: "wpn_gauss",
  wpn_grenade_f1: "wpn_grenade_f1",
  wpn_grenade_fake: "wpn_grenade_fake",
  wpn_grenade_launcher: "wpn_grenade_launcher",
  wpn_grenade_rgd5: "wpn_grenade_rgd5",
  wpn_grenade_rpg7: "wpn_grenade_rpg7",
  wpn_groza: "wpn_groza",
  wpn_groza_nimble: "wpn_groza_nimble",
  wpn_knife: "wpn_knife",
  wpn_l85: "wpn_l85",
  wpn_lr300: "wpn_lr300",
  wpn_mp5: "wpn_mp5",
  wpn_mp5_nimble: "wpn_mp5_nimble",
  wpn_pkm: "wpn_pkm",
  wpn_pkm_zulus: "wpn_pkm_zulus",
  wpn_pm_actor: "wpn_pm_actor",
  wpn_protecta: "wpn_protecta",
  wpn_protecta_nimble: "wpn_protecta_nimble",
  "wpn_rg-6": "wpn_rg-6",
  wpn_rg6: "wpn_rg6",
  wpn_rpg7: "wpn_rpg7",
  wpn_scope: "wpn_scope",
  wpn_shotgun: "wpn_shotgun",
  wpn_sig220: "wpn_sig220",
  wpn_sig220_nimble: "wpn_sig220_nimble",
  wpn_sig550: "wpn_sig550",
  wpn_sig550_luckygun: "wpn_sig550_luckygun",
  wpn_silencer: "wpn_silencer",
  wpn_spas12: "wpn_spas12",
  wpn_spas12_nimble: "wpn_spas12_nimble",
  wpn_stat_mgun: "wpn_stat_mgun",
  wpn_svd: "wpn_svd",
  wpn_svd_nimble: "wpn_svd_nimble",
  wpn_svu: "wpn_svu",
  wpn_svu_nimble: "wpn_svu_nimble",
  wpn_toz34: "wpn_toz34",
  wpn_usp45: "wpn_usp45",
  wpn_usp_nimble: "wpn_usp_nimble",
  wpn_val: "wpn_val",
  wpn_vintorez: "wpn_vintorez",
  wpn_vintorez_nimble: "wpn_vintorez_nimble",
  wpn_wincheaster1300: "wpn_wincheaster1300",
  wpn_wincheaster1300_trapper: "wpn_wincheaster1300_trapper",
  wpn_wmagaz: "wpn_wmagaz",
  wpn_wmaggl: "wpn_wmaggl",
} as const;

/**
 * Type definition of available weapons list.
 */
export type TWeapons = typeof weapons;

/**
 * Type definition of single weapon section.
 */
export type TWeapon = TWeapons[keyof TWeapons];

/**
 * Set of nimble weapons.
 */
export const nimbleWeapons = {
  [weapons.wpn_desert_eagle_nimble]: true,
  [weapons.wpn_fn2000_nimble]: true,
  [weapons.wpn_g36_nimble]: true,
  [weapons.wpn_groza_nimble]: true,
  [weapons.wpn_mp5_nimble]: true,
  [weapons.wpn_protecta_nimble]: true,
  [weapons.wpn_sig220_nimble]: true,
  [weapons.wpn_spas12_nimble]: true,
  [weapons.wpn_svd_nimble]: true,
  [weapons.wpn_svu_nimble]: true,
  [weapons.wpn_usp_nimble]: true,
  [weapons.wpn_vintorez_nimble]: true,
} as Record<TName, boolean>;
