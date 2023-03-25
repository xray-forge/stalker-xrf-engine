import { TXR_animation, TXR_look, TXR_move, TXR_SightType, XR_game_object, XR_vector } from "xray16";

import { AnyCallable, LuaArray, Optional } from "@/engine/lib/types";

/**
 * Action IDs of state manager evaluators.
 */
export enum EStateEvaluatorId {
  end = 1,
  locked = 2,
  locked_external = 3,

  // -- WEAPON
  weapon = 11,
  weapon_locked = 12,
  weapon_strapped = 13,
  weapon_strapped_now = 14,
  weapon_unstrapped = 15,
  weapon_unstrapped_now = 16,
  weapon_none = 17,
  weapon_none_now = 18,
  weapon_drop = 19,
  weapon_fire = 20,

  // -- MOVEMENT
  movement = 21,
  movement_walk = 22,
  movement_run = 23,
  movement_stand = 24,
  movement_stand_now = 25,

  // -- MENTAL STATES
  mental = 31,
  mental_free = 32,
  mental_free_now = 33,
  mental_danger = 34,
  mental_danger_now = 35,
  mental_panic = 36,
  mental_panic_now = 37,

  // -- BODYSTATES
  bodystate = 41,
  bodystate_crouch = 42,
  bodystate_standing = 43,
  bodystate_crouch_now = 44,
  bodystate_standing_now = 45,

  // -- DIRECTION
  direction = 51,
  direction_search = 52,

  // -- ANIMSTATE
  animstate = 61,
  animstate_locked = 62,
  animstate_idle_now = 64,
  animstate_play_now = 66,

  // -- ANIMATION
  animation = 81,
  animation_locked = 82,
  animation_play_now = 84,
  animation_none_now = 86,

  // -- SMARTCOVER
  smartcover_need = 90,
  smartcover = 91,
  in_smartcover = 92,
  // --    smartcover_locked]           = 92,
}

/**
 * Action IDs of state manager actions.
 */
export enum EStateActionId {
  end = 1,
  locked = 2,
  locked_external = 3,
  locked_animation = 4,
  locked_animstate = 5,
  locked_smartcover = 6,

  weapon_strapp = 11,
  weapon_unstrapp = 12,
  weapon_none = 13,
  weapon_fire = 14,
  weapon_drop = 15,

  movement = 21,
  movement_walk = 22,
  movement_run = 23,
  movement_stand = 24,
  movement_walk_turn = 25,
  movement_walk_search = 26,
  movement_stand_turn = 27,
  movement_stand_search = 28,
  movement_run_turn = 29,
  movement_run_search = 30,

  mental_free = 31,
  mental_danger = 32,
  mental_panic = 33,

  bodystate_crouch = 41,
  bodystate_standing = 42,
  bodystate_crouch_danger = 43,
  bodystate_standing_free = 44,

  direction_turn = 51,
  direction_search = 52,

  animstate_start = 61,
  animstate_stop = 62,

  animation_start = 71,
  animation_stop = 72,

  walk_turn = 75,
  walk_search = 76,
  stand_turn = 77,
  stand_search = 78,

  smartcover_enter = 80,
  smartcover_exit = 81,
}

/**
 * todo;
 */
export interface IAnimationDescriptor {
  prop: {
    maxidle: number;
    sumidle: number;
    rnd: number;
    moving: Optional<boolean>;
  };
  into: Optional<LuaArray<string | { a: string } | { f: AnyCallable }>>;
  out: Optional<LuaArray<string | { a: string } | { f: AnyCallable }>>;
  idle: Optional<LuaArray<string | { a: string } | { f: AnyCallable }>>;
  rnd: Optional<LuaArray<LuaTable<number, string>>>;
}

/**
 * todo;
 */
export interface IAnimationStateDescriptor {
  prop: {
    maxidle: number;
    sumidle: number;
    rnd: number;
  };
  into: LuaTable<number, string>;
  out: LuaTable<number, string>;
  idle: LuaTable<number, string>;
  rnd: LuaTable<number, LuaTable<number, string>>;
}

/**
 * todo;
 */
export enum EWeaponAnimation {
  NONE = "none",
  DROP = "drop",
  FIRE = "fire",
  STRAPPED = "strapped",
  UNSTRAPPED = "unstrapped",
  SNIPER_FIRE = "sniper_fire",
}

/**
 * todo;
 */
export enum EStalkerState {
  ASSAULT = "assault",
  GUARD = "guard",
  GUARD_NA = "guard_na",
  HELP_WOUNDED = "help_wounded",
  HIDE = "hide",
  HIDE_FIRE = "hide_fire",
  HIDE_NA = "hide_na",
  HIDE_SNIPER_FIRE = "hide_sniper_fire",
  IDLE = "idle",
  PATROL = "patrol",
  RAID = "raid",
  RAID_FIRE = "raid_fire",
  RUN = "run",
  RUSH = "rush",
  SEARCH_CORPSE = "search_corpse",
  SIT = "sit",
  SLEEP = "sleep",
  SMART_COVER = "smartcover",
  SNEAK = "sneak",
  SNEAK_RUN = "sneak_run",
  THREAT = "threat",
  THREAT_FIRE = "threat_fire",
  THREAT_NA = "threat_na",
  TRUE = "true",
  WALK = "walk",
}

/**
 * todo;
 */
export interface IStateDescriptor {
  weapon: Optional<EWeaponAnimation>;
  movement?: Optional<TXR_move>;
  mental: Optional<TXR_animation>;
  bodystate: Optional<TXR_move>;
  animstate: Optional<EStalkerState>;
  animation: Optional<EStalkerState>;
  weapon_slot?: Optional<number>;
  direction?: TXR_look | TXR_SightType;
  special_danger_move?: Optional<boolean>;
  isForced: Optional<boolean>;
}

/**
 * todo;
 */
export interface ITargetStateDescriptor {
  look_object: Optional<XR_game_object>;
  look_position: Optional<XR_vector>;
}
