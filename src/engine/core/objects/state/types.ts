import {
  AnyCallable,
  ClientObject,
  LuaArray,
  Optional,
  TAnimationType,
  TLookType,
  TMoveType,
  TSightType,
  Vector,
} from "@/engine/lib/types";

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
  ANIMPOINT_SIT_HIGH = "animpoint_sit_high",
  ANIMPOINT_SIT_HIGH_DRINK_ENERGY = "animpoint_sit_high_drink_energy",
  ANIMPOINT_SIT_HIGH_DRINK_VODKA = "animpoint_sit_high_drink_vodka",
  ANIMPOINT_SIT_HIGH_EAT_BREAD = "animpoint_sit_high_eat_bread",
  ANIMPOINT_SIT_HIGH_EAT_KOLBASA = "animpoint_sit_high_eat_kolbasa",
  ANIMPOINT_SIT_HIGH_HARMONICA = "animpoint_sit_high_harmonica",
  ANIMPOINT_SIT_LOW = "animpoint_sit_low",
  ANIMPOINT_SIT_LOW_DRINK_ENERGY = "animpoint_sit_low_drink_energy",
  ANIMPOINT_SIT_LOW_DRINK_VODKA = "animpoint_sit_low_drink_vodka",
  ANIMPOINT_SIT_LOW_EAT_BREAD = "animpoint_sit_low_eat_bread",
  ANIMPOINT_SIT_LOW_EAT_KOLBASA = "animpoint_sit_low_eat_kolbasa",
  ANIMPOINT_SIT_LOW_GUITAR = "animpoint_sit_low_guitar",
  ANIMPOINT_SIT_LOW_HARMONICA = "animpoint_sit_low_harmonica",
  ANIMPOINT_SIT_NORMAL = "animpoint_sit_normal",
  ANIMPOINT_SIT_NORMAL_DRINK_ENERGY = "animpoint_sit_normal_drink_energy",
  ANIMPOINT_SIT_NORMAL_DRINK_VODKA = "animpoint_sit_normal_drink_vodka",
  ANIMPOINT_SIT_NORMAL_EAT_BREAD = "animpoint_sit_normal_eat_bread",
  ANIMPOINT_SIT_NORMAL_EAT_KOLBASA = "animpoint_sit_normal_eat_kolbasa",
  ANIMPOINT_SIT_NORMAL_GUITAR = "animpoint_sit_normal_guitar",
  ANIMPOINT_STAY_TABLE = "animpoint_stay_table",
  ANIMPOINT_STAY_TABLE_DRINK_ENERGY = "animpoint_stay_table_drink_energy",
  ANIMPOINT_STAY_TABLE_DRINK_VODKA = "animpoint_stay_table_drink_vodka",
  ANIMPOINT_STAY_TABLE_EAT_BREAD = "animpoint_stay_table_eat_bread",
  ANIMPOINT_STAY_TABLE_EAT_KOLBASA = "animpoint_stay_table_eat_kolbasa",
  ANIMPOINT_STAY_TABLE_WEAPON = "animpoint_stay_table_weapon",
  ANIMPOINT_STAY_WALL = "animpoint_stay_wall",
  ANIMPOINT_STAY_WALL_DRINK_ENERGY = "animpoint_stay_wall_drink_energy",
  ANIMPOINT_STAY_WALL_DRINK_VODKA = "animpoint_stay_wall_drink_vodka",
  ANIMPOINT_STAY_WALL_EAT_BREAD = "animpoint_stay_wall_eat_bread",
  ANIMPOINT_STAY_WALL_EAT_KOLBASA = "animpoint_stay_wall_eat_kolbasa",
  ANIMPOINT_STAY_WALL_WEAPON = "animpoint_stay_wall_weapon",
  ASSAULT = "assault",
  ASSAULT_FIRE = "assault_fire",
  BACKOFF = "backoff",
  BACKOFF2 = "backoff2",
  BINOCULAR = "binocular",
  BLOODSUCKER_SEARCH = "bloodsucker_search",
  CAUTION = "caution",
  CHOOSE = "choose",
  CHOOSING = "choosing",
  CLAIM = "claim",
  CR_RACIYA = "cr_raciya",
  DYNAMITE = "dynamite",
  FOLD_ARMS = "fold_arms",
  GIVE_ORDERS = "give_orders",
  GUARD = "guard",
  GUARD_CHASOVOY = "guard_chasovoy",
  GUARD_FIRE = "guard_fire",
  GUARD_RAC = "guard_rac",
  GUARD_NA = "guard_na",
  HANDS_UP = "hands_up",
  HELLO = "hello",
  HELLO_WPN = "hello_wpn",
  HELP_WOUNDED = "help_wounded",
  HIDE = "hide",
  HIDE_FIRE = "hide_fire",
  HIDE_NA = "hide_na",
  HIDE_NO_WPN = "hide_no_wpn",
  HIDE_RAC = "hide_rac",
  HIDE_SNIPER_FIRE = "hide_sniper_fire",
  IDLE = "idle",
  IDLE_CHASOVOY = "idle_chasovoy",
  LAY_ON_BED = "lay_on_bed",
  PATROL = "patrol",
  PATROL_FIRE = "patrol_fire",
  PLAY_GUITAR = "play_guitar",
  PLAY_HARMONICA = "play_harmonica",
  POISK = "poisk",
  PRESS = "press",
  PRISONER = "prisoner",
  PROBE_CROUCH = "probe_crouch",
  PROBE_CROUCH_DETECTOR_ADVANCED = "probe_crouch_detector_advanced",
  PROBE_CROUCH_DETECTOR_ELITE = "probe_crouch_detector_elite",
  PROBE_STAND = "probe_stand",
  PROBE_STAND_DETECTOR_ADVANCED = "probe_stand_detector_advanced",
  PROBE_STAND_DETECTOR_ELITE = "probe_stand_detector_elite",
  PROBE_WAY = "probe_way",
  PROBE_WAY_DETECTOR_ADVANCED = "probe_way_detector_advanced",
  PROBE_WAY_DETECTOR_ELITE = "probe_way_detector_elite",
  PSY_ARMED = "psy_armed",
  PSY_PAIN = "psy_pain",
  PSY_SHOOT = "psy_shoot",
  PUNCH = "punch",
  RACIYA = "raciya",
  RACIYA_STC = "raciya_stc",
  RAID = "raid",
  RAID_FIRE = "raid_fire",
  REFUSE = "refuse",
  RUN = "run",
  RUSH = "rush",
  SALUT = "salut",
  SALUT_FREE = "salut_free",
  SCANER_CROUCH = "scaner_crouch",
  SCANER_STAND = "scaner_stand",
  SCANER_WAY = "scaner_way",
  SEARCH = "search",
  SEARCH_CORPSE = "search_corpse",
  SIT = "sit",
  SIT_ASS = "sit_ass",
  SIT_KNEE = "sit_knee",
  SLEEP = "sleep",
  SLEEPING = "sleeping",
  SMART_COVER = "smartcover",
  SNEAK = "sneak",
  SNEAK_FIRE = "sneak_fire",
  SNEAK_NO_WPN = "sneak_no_wpn",
  SNEAK_RUN = "sneak_run",
  SPRINT = "sprint",
  STOOP_NO_WEAP = "stoop_no_weap",
  TALK_DEFAULT = "talk_default",
  THREAT = "threat",
  THREAT_DANGER = "threat_danger",
  THREAT_FIRE = "threat_fire",
  THREAT_HELI = "threat_heli",
  THREAT_NA = "threat_na",
  THREAT_SNIPER_FIRE = "threat_sniper_fire",
  TRANS_0 = "trans_0",
  TRANS_1 = "trans_1",
  TRANS_ZOMBIED = "trans_zombied",
  TRUE = "true",
  WAIT = "wait",
  WAIT_NA = "wait_na",
  WAIT_TRADE = "wait_trade",
  WAIT_RAC = "wait_rac",
  WAIT_RAC_NOWEAP = "wait_rac_noweap",
  WAIT_RAC_STC = "wait_rac_stc",
  WALK = "walk",
  WALKER_CAMP = "walker_camp",
  WALK_NOWEAP = "walk_noweap",
  WARD = "ward",
  WARDING = "warding",
  WARDING_SHORT = "warding_short",
  WARD_NOWEAP = "ward_noweap",
  WARD_NOWEAP_SHORT = "ward_noweap_short",
  WARD_SHORT = "ward_short",
  WOUNDED = "wounded",
  WOUNDED_HEAVY = "wounded_heavy",
  WOUNDED_HEAVY_1 = "wounded_heavy_1",
  WOUNDED_HEAVY_2 = "wounded_heavy_2",
  WOUNDED_HEAVY_3 = "wounded_heavy_3",
  WOUNDED_ZOMBIE = "wounded_zombie",
}

/**
 * todo;
 */
export interface IStateDescriptor {
  weapon: Optional<EWeaponAnimation>;
  movement?: Optional<TMoveType>;
  mental: Optional<TAnimationType>;
  bodystate: Optional<TMoveType>;
  animstate: Optional<EStalkerState>;
  animation: Optional<EStalkerState>;
  weapon_slot?: Optional<number>;
  direction?: TLookType | TSightType;
  special_danger_move?: Optional<boolean>;
  isForced: Optional<boolean>;
}

/**
 * todo;
 * todo: use camelcased variant
 */
export interface ITargetStateDescriptor {
  look_object: Optional<ClientObject>;
  look_position: Optional<Vector>;
}
