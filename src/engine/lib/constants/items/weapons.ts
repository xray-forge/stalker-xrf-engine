/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * todo;
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
 * todo;
 */
export type TPistols = typeof pistols;

/**
 * todo;
 */
export type TPistol = TPistols[keyof TPistols];

/**
 * todo;
 */
export const weapons = {
  ...pistols,
  grenade_f1: "grenade_f1",
  grenade_rgd5: "grenade_rgd5",
  wpn_abakan: "wpn_abakan",
  wpn_ak74: "wpn_ak74",
  wpn_ak74_s: "wpn_ak74_s",
  wpn_ak74u: "wpn_ak74u",
  wpn_ak74u_snag: "wpn_ak74u_snag",
  wpn_ammo: "wpn_ammo",
  wpn_ammo_m209: "wpn_ammo_m209",
  wpn_ammo_m209_s: "wpn_ammo_m209_s",
  wpn_ammo_og7b: "wpn_ammo_og7b",
  wpn_ammo_og7b_s: "wpn_ammo_og7b_s",
  wpn_ammo_s: "wpn_ammo_s",
  wpn_ammo_vog25: "wpn_ammo_vog25",
  wpn_ammo_vog25_s: "wpn_ammo_vog25_s",
  wpn_auto_shotgun_s: "wpn_auto_shotgun_s",
  wpn_binoc: "wpn_binoc",
  wpn_binocular: "wpn_binocular",
  wpn_binocular_s: "wpn_binocular_s",
  wpn_bm16: "wpn_bm16",
  wpn_bm16_s: "wpn_bm16_s",
  wpn_desert_eagle_nimble: "wpn_desert_eagle_nimble",
  wpn_fn2000: "wpn_fn2000",
  wpn_fn2000_nimble: "wpn_fn2000_nimble",
  wpn_fort_snag: "wpn_fort_snag",
  wpn_g36: "wpn_g36",
  wpn_g36_nimble: "wpn_g36_nimble",
  wpn_gauss: "wpn_gauss",
  wpn_grenade_f1: "wpn_grenade_f1",
  wpn_grenade_f1_s: "wpn_grenade_f1_s",
  wpn_grenade_fake: "wpn_grenade_fake",
  wpn_grenade_launcher: "wpn_grenade_launcher",
  wpn_grenade_launcher_s: "wpn_grenade_launcher_s",
  wpn_grenade_rgd5: "wpn_grenade_rgd5",
  wpn_grenade_rgd5_s: "wpn_grenade_rgd5_s",
  wpn_grenade_rpg7: "wpn_grenade_rpg7",
  wpn_groza: "wpn_groza",
  wpn_groza_nimble: "wpn_groza_nimble",
  wpn_groza_s: "wpn_groza_s",
  wpn_hpsa_s: "wpn_hpsa_s",
  wpn_knife: "wpn_knife",
  wpn_knife_s: "wpn_knife_s",
  wpn_l85: "wpn_l85",
  wpn_lr300: "wpn_lr300",
  wpn_lr300_s: "wpn_lr300_s",
  wpn_mp5: "wpn_mp5",
  wpn_mp5_nimble: "wpn_mp5_nimble",
  wpn_pkm: "wpn_pkm",
  wpn_pkm_zulus: "wpn_pkm_zulus",
  wpn_pm_actor: "wpn_pm_actor",
  wpn_pm_s: "wpn_pm_s",
  wpn_protecta: "wpn_protecta",
  wpn_protecta_nimble: "wpn_protecta_nimble",
  "wpn_rg-6": "wpn_rg-6",
  wpn_rg6: "wpn_rg6",
  wpn_rg6_s: "wpn_rg6_s",
  wpn_rpg7: "wpn_rpg7",
  wpn_rpg7_s: "wpn_rpg7_s",
  wpn_scope: "wpn_scope",
  wpn_scope_s: "wpn_scope_s",
  wpn_shotgun: "wpn_shotgun",
  wpn_shotgun_s: "wpn_shotgun_s",
  wpn_sig220: "wpn_sig220",
  wpn_sig220_nimble: "wpn_sig220_nimble",
  wpn_sig550: "wpn_sig550",
  wpn_sig550_luckygun: "wpn_sig550_luckygun",
  wpn_silencer: "wpn_silencer",
  wpn_silencer_s: "wpn_silencer_s",
  wpn_spas12: "wpn_spas12",
  wpn_spas12_nimble: "wpn_spas12_nimble",
  wpn_stat_mgun: "wpn_stat_mgun",
  wpn_svd: "wpn_svd",
  wpn_svd_nimble: "wpn_svd_nimble",
  wpn_svd_s: "wpn_svd_s",
  wpn_svu: "wpn_svu",
  wpn_svu_nimble: "wpn_svu_nimble",
  wpn_svu_s: "wpn_svu_s",
  wpn_toz34: "wpn_toz34",
  wpn_usp45: "wpn_usp45",
  wpn_usp45_s: "wpn_usp45_s",
  wpn_usp_nimble: "wpn_usp_nimble",
  wpn_val: "wpn_val",
  wpn_val_s: "wpn_val_s",
  wpn_vintorez: "wpn_vintorez",
  wpn_vintorez_nimble: "wpn_vintorez_nimble",
  wpn_vintorez_s: "wpn_vintorez_s",
  wpn_walther_s: "wpn_walther_s",
  wpn_wincheaster1300: "wpn_wincheaster1300",
  wpn_wincheaster1300_trapper: "wpn_wincheaster1300_trapper",
  wpn_wmagaz: "wpn_wmagaz",
  wpn_wmaggl: "wpn_wmaggl",
} as const;

/**
 * todo;
 */
export type TWeapons = typeof weapons;

/**
 * todo;
 */
export type TWeapon = TWeapons[keyof TWeapons];
