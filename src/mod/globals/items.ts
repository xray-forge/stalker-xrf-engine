/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const weapons = {
  wpn_ak74: "wpn_ak74",
  wpn_ak74_s: "wpn_ak74_s",
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
  wpn_fn2000: "wpn_fn2000",
  wpn_fort: "wpn_fort",
  wpn_grenade_f1: "wpn_grenade_f1",
  wpn_grenade_f1_s: "wpn_grenade_f1_s",
  wpn_grenade_fake: "wpn_grenade_fake",
  wpn_grenade_launcher: "wpn_grenade_launcher",
  wpn_grenade_launcher_s: "wpn_grenade_launcher_s",
  wpn_grenade_rgd5: "wpn_grenade_rgd5",
  wpn_grenade_rgd5_s: "wpn_grenade_rgd5_s",
  wpn_grenade_rpg7: "wpn_grenade_rpg7",
  wpn_groza: "wpn_groza",
  wpn_groza_s: "wpn_groza_s",
  wpn_hpsa: "wpn_hpsa",
  wpn_hpsa_s: "wpn_hpsa_s",
  wpn_knife: "wpn_knife",
  wpn_knife_s: "wpn_knife_s",
  wpn_lr300: "wpn_lr300",
  wpn_lr300_s: "wpn_lr300_s",
  wpn_pm: "wpn_pm",
  wpn_pm_s: "wpn_pm_s",
  wpn_rg6: "wpn_rg6",
  wpn_rg6_s: "wpn_rg6_s",
  wpn_rpg7: "wpn_rpg7",
  wpn_rpg7_s: "wpn_rpg7_s",
  wpn_scope: "wpn_scope",
  wpn_scope_s: "wpn_scope_s",
  wpn_shotgun: "wpn_shotgun",
  wpn_shotgun_s: "wpn_shotgun_s",
  wpn_silencer: "wpn_silencer",
  wpn_silencer_s: "wpn_silencer_s",
  wpn_stat_mgun: "wpn_stat_mgun",
  wpn_svd: "wpn_svd",
  wpn_svd_s: "wpn_svd_s",
  wpn_svu: "wpn_svu",
  wpn_svu_s: "wpn_svu_s",
  wpn_usp45: "wpn_usp45",
  wpn_usp45_s: "wpn_usp45_s",
  wpn_val: "wpn_val",
  wpn_val_s: "wpn_val_s",
  wpn_vintorez: "wpn_vintorez",
  wpn_vintorez_s: "wpn_vintorez_s",
  wpn_walther: "wpn_walther",
  wpn_walther_s: "wpn_walther_s",
  wpn_wmagaz: "wpn_wmagaz",
  wpn_wmaggl: "wpn_wmaggl"
} as const;

export type TWeapons = typeof weapons;

export type TWeapon = TWeapons[keyof TWeapons];

export const misc = {
  bolt: "bolt",
  device_pda: "device_pda",
  guitar_a: "guitar_a",
  harmonica_a: "harmonica_a",
  wpn_binoc: weapons.wpn_binoc
} as const;

export type TMiscItems = typeof misc;

export type TMiscItem = TMiscItems[keyof TMiscItems];
