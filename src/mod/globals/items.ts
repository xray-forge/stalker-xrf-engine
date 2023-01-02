/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const weapons = {
  wpn_binoc: "wpn_binoc",
  wpn_knife: "wpn_knife"
} as const;

export const weaponsNames = {
  abakan: "abakan",
  ak74: "ak74",
  ak74u: "ak74u",
  beretta: "beretta",
  bm16: "bm16",
  colt1911: "colt1911",
  desert: "desert",
  f1: "f1",
  fn2000: "fn2000",
  fort: "fort",
  g36: "g36",
  gauss: "gauss",
  groza: "groza",
  hpsa: "hpsa",
  knife: "knife",
  l85: "l85",
  lr300: "lr300",
  mp5: "mp5",
  pb: "pb",
  pkm: "pkm",
  pm: "pm",
  protecta: "protecta",
  rg: "rg",
  rgd5: "rgd5",
  rpg7: "rpg7",
  sig220: "sig220",
  sig550: "sig550",
  spas12: "spas12",
  svd: "svd",
  svu: "svu",
  toz34: "toz34",
  usp45: "usp45",
  val: "val",
  vintorez: "vintorez",
  walther: "walther",
  wincheaster130: "wincheaster130"
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
