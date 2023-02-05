/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const weapon_addons = {
  scope_contrast: "scope_contrast",
  scope_detector: "scope_detector",
  scope_nightvision: "scope_nightvision",
  wpn_addon_grenade_launcher: "wpn_addon_grenade_launcher",
  wpn_addon_grenade_launcher_m203: "wpn_addon_grenade_launcher_m203",
  wpn_addon_scope: "wpn_addon_scope",
  wpn_addon_scope_detector: "wpn_addon_scope_detector",
  wpn_addon_scope_night: "wpn_addon_scope_night",
  wpn_addon_scope_susat: "wpn_addon_scope_susat",
  wpn_addon_scope_susat_custom: "wpn_addon_scope_susat_custom",
  wpn_addon_scope_susat_dusk: "wpn_addon_scope_susat_dusk",
  wpn_addon_scope_susat_night: "wpn_addon_scope_susat_night",
  "wpn_addon_scope_susat_x1.6": "wpn_addon_scope_susat_x1.6",
  "wpn_addon_scope_x2.7": "wpn_addon_scope_x2.7",
  wpn_addon_silencer: "wpn_addon_silencer",
} as const;

export type TWeaponAddons = typeof weapon_addons;

export type TWeaponAddon = TWeaponAddons[keyof TWeaponAddons];
