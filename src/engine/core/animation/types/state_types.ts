import type { EWeaponAnimation } from "@/engine/core/animation/types/animation_types";
import type {
  AnyCallable,
  AnyContextualCallable,
  AnyObject,
  Optional,
  TAnimationType,
  TDuration,
  TIndex,
  TLookType,
  TMoveType,
  TName,
  TNumberId,
  TSightType,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

/**
 * todo;
 */
export enum ESmartCoverState {
  FIRE_TARGET = "fire_target",
  FIRE_NO_LOOKOUT_TARGET = "fire_no_lookout_target",
  IDLE_TARGET = "idle_target",
  LOOKOUT_TARGET = "lookout_target",
}

/**
 * todo;
 */
export enum EStalkerState {
  ANIMPOINT_SIT_ASS = "animpoint_sit_ass",
  ANIMPOINT_SIT_ASS_DRINK_ENERGY = "animpoint_sit_ass_drink_energy",
  ANIMPOINT_SIT_ASS_DRINK_VODKA = "animpoint_sit_ass_drink_vodka",
  ANIMPOINT_SIT_ASS_EAT_BREAD = "animpoint_sit_ass_eat_bread",
  ANIMPOINT_SIT_ASS_EAT_KOLBASA = "animpoint_sit_ass_eat_kolbasa",
  ANIMPOINT_SIT_ASS_GUITAR = "animpoint_sit_ass_guitar",
  ANIMPOINT_SIT_ASS_HARMONICA = "animpoint_sit_ass_harmonica",
  ANIMPOINT_SIT_HIGH = "animpoint_sit_high",
  ANIMPOINT_SIT_HIGH_DRINK_ENERGY = "animpoint_sit_high_drink_energy",
  ANIMPOINT_SIT_HIGH_DRINK_VODKA = "animpoint_sit_high_drink_vodka",
  ANIMPOINT_SIT_HIGH_EAT_BREAD = "animpoint_sit_high_eat_bread",
  ANIMPOINT_SIT_HIGH_EAT_KOLBASA = "animpoint_sit_high_eat_kolbasa",
  ANIMPOINT_SIT_HIGH_GUITAR = "animpoint_sit_high_guitar",
  ANIMPOINT_SIT_HIGH_HARMONICA = "animpoint_sit_high_harmonica",
  ANIMPOINT_SIT_HIGH_NO_RND = "animpoint_sit_high_guitar_no_rnd",
  ANIMPOINT_SIT_HIGH_WEAPON = "animpoint_sit_high_weapon",
  ANIMPOINT_SIT_KNEE = "animpoint_sit_knee",
  ANIMPOINT_SIT_KNEE_DRINK_ENERGY = "animpoint_sit_knee_drink_energy",
  ANIMPOINT_SIT_KNEE_DRINK_VODKA = "animpoint_sit_knee_drink_vodka",
  ANIMPOINT_SIT_KNEE_EAT_BREAD = "animpoint_sit_knee_eat_bread",
  ANIMPOINT_SIT_KNEE_EAT_KOLBASA = "animpoint_sit_knee_eat_kolbasa",
  ANIMPOINT_SIT_KNEE_GUITAR = "animpoint_sit_knee_guitar",
  ANIMPOINT_SIT_KNEE_HARMONICA = "animpoint_sit_knee_harmonica",
  ANIMPOINT_SIT_LOW = "animpoint_sit_low",
  ANIMPOINT_SIT_LOW_DRINK_ENERGY = "animpoint_sit_low_drink_energy",
  ANIMPOINT_SIT_LOW_DRINK_VODKA = "animpoint_sit_low_drink_vodka",
  ANIMPOINT_SIT_LOW_EAT_BREAD = "animpoint_sit_low_eat_bread",
  ANIMPOINT_SIT_LOW_EAT_KOLBASA = "animpoint_sit_low_eat_kolbasa",
  ANIMPOINT_SIT_LOW_GUITAR = "animpoint_sit_low_guitar",
  ANIMPOINT_SIT_LOW_HARMONICA = "animpoint_sit_low_harmonica",
  ANIMPOINT_SIT_LOW_NO_RND = "animpoint_sit_low_no_rnd",
  ANIMPOINT_SIT_LOW_WEAPON = "animpoint_sit_low_weapon",
  ANIMPOINT_SIT_NORMAL = "animpoint_sit_normal",
  ANIMPOINT_SIT_NORMAL_DRINK_ENERGY = "animpoint_sit_normal_drink_energy",
  ANIMPOINT_SIT_NORMAL_DRINK_VODKA = "animpoint_sit_normal_drink_vodka",
  ANIMPOINT_SIT_NORMAL_EAT_BREAD = "animpoint_sit_normal_eat_bread",
  ANIMPOINT_SIT_NORMAL_EAT_KOLBASA = "animpoint_sit_normal_eat_kolbasa",
  ANIMPOINT_SIT_NORMAL_GUITAR = "animpoint_sit_normal_guitar",
  ANIMPOINT_SIT_NORMAL_HARMONICA = "animpoint_sit_normal_harmonica",
  ANIMPOINT_SIT_NORMAL_NO_RND = "animpoint_sit_normal_no_rnd",
  ANIMPOINT_SIT_NORMAL_WEAPON = "animpoint_sit_normal_weapon",
  ANIMPOINT_STAY_TABLE = "animpoint_stay_table",
  ANIMPOINT_STAY_TABLE_DRINK_ENERGY = "animpoint_stay_table_drink_energy",
  ANIMPOINT_STAY_TABLE_DRINK_VODKA = "animpoint_stay_table_drink_vodka",
  ANIMPOINT_STAY_TABLE_EAT_BREAD = "animpoint_stay_table_eat_bread",
  ANIMPOINT_STAY_TABLE_EAT_KOLBASA = "animpoint_stay_table_eat_kolbasa",
  ANIMPOINT_STAY_TABLE_GUITAR = "animpoint_stay_table_guitar",
  ANIMPOINT_STAY_TABLE_HARMONICA = "animpoint_stay_table_harmonica",
  ANIMPOINT_STAY_TABLE_NO_RND = "animpoint_stay_table_no_rnd",
  ANIMPOINT_STAY_TABLE_WEAPON = "animpoint_stay_table_weapon",
  ANIMPOINT_STAY_WALL = "animpoint_stay_wall",
  ANIMPOINT_STAY_WALL_DRINK_ENERGY = "animpoint_stay_wall_drink_energy",
  ANIMPOINT_STAY_WALL_DRINK_VODKA = "animpoint_stay_wall_drink_vodka",
  ANIMPOINT_STAY_WALL_EAT_BREAD = "animpoint_stay_wall_eat_bread",
  ANIMPOINT_STAY_WALL_EAT_KOLBASA = "animpoint_stay_wall_eat_kolbasa",
  ANIMPOINT_STAY_WALL_GUITAR = "animpoint_stay_wall_guitar",
  ANIMPOINT_STAY_WALL_HARMONICA = "animpoint_stay_wall_harmonica",
  ANIMPOINT_STAY_WALL_NO_RND = "animpoint_stay_wall_no_rnd",
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
  EAT_BREAD = "eat_bread",
  EAT_ENERGY = "eat_energy",
  EAT_KOLBASA = "eat_kolbasa",
  EAT_VODKA = "eat_vodka",
  FIRE = "fire",
  FOLD_ARMS = "fold_arms",
  GIVE_ORDERS = "give_orders",
  GUARD = "guard",
  GUARD_CHASOVOY = "guard_chasovoy",
  GUARD_FIRE = "guard_fire",
  GUARD_NA = "guard_na",
  GUARD_RAC = "guard_rac",
  HANDS_UP = "hands_up",
  HELLO = "hello",
  HELLO_WPN = "hello_wpn",
  HELP_WOUNDED = "help_wounded",
  HELP_WOUNDED_WITH_MEDKIT = "help_wounded_with_medkit",
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
  SLEEP_SIT = "sleep_sit",
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
  WAIT_RAC = "wait_rac",
  WAIT_RAC_NOWEAP = "wait_rac_noweap",
  WAIT_RAC_STC = "wait_rac_stc",
  WAIT_TRADE = "wait_trade",
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
  movement: Optional<TMoveType>;
  mental: Optional<TAnimationType>;
  bodystate: Optional<TMoveType>;
  animstate: Optional<TName>;
  animation: Optional<TName>;
  weaponSlot?: Optional<TIndex>;
  direction?: TLookType | TSightType;
  special_danger_move?: Optional<boolean>;
  isForced?: Optional<boolean>;
}

/**
 * Descriptor of loop position for state animation.
 */
export interface ILookTargetDescriptor {
  lookObjectId?: Optional<TNumberId>;
  lookPosition?: Optional<Vector>;
}

/**
 * todo;
 */
export interface IStateManagerCallbackDescriptor<T extends AnyObject = AnyObject> {
  begin?: Optional<TTimestamp>;
  timeout?: Optional<TDuration>;
  context: T;
  callback: Optional<AnyContextualCallable<T>>;
  turnEndCallback?: Optional<AnyCallable>;
}

/**
 * todo;
 */
export interface ITargetStateDescriptorExtras {
  isForced?: boolean;
  animation?: boolean;
  animationPosition?: Optional<Vector>;
  animationDirection?: Optional<Vector>;
}

/**
 * todo;
 */
export const LOOK_DIRECTION_STATES: LuaTable<EStalkerState, boolean> = $fromObject({
  threat_na: true,
  wait_na: true,
  guard_na: true,
} as Record<EStalkerState, boolean>);
