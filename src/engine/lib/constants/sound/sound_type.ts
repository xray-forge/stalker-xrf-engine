/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * Enumeration describing sound type that can be heard by game objects.
 * Usually provided in `hear` callbacks.
 */
export enum ESoundType {
  ITM = "ITM",
  ITM_drop = "ITM_drop",
  ITM_hide = "ITM_hide",
  ITM_pckup = "ITM_pckup",
  ITM_take = "ITM_take",
  ITM_use = "ITM_use",
  MST = "MST",
  MST_attack = "MST_attack",
  MST_damage = "MST_damage",
  MST_die = "MST_die",
  MST_eat = "MST_eat",
  MST_step = "MST_step",
  MST_talk = "MST_talk",
  NIL = "NIL",
  WPN = "WPN",
  WPN_empty = "WPN_empty",
  WPN_hit = "WPN_hit",
  WPN_reload = "WPN_reload",
  WPN_shoot = "WPN_shoot",
}
