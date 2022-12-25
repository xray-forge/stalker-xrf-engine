/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const weapons = {
  wpn_knife: "wpn_knife"
};

export type TWeapons = typeof weapons;

export type TWeapon = TWeapons[keyof TWeapons];
