import type { PartialRecord } from "@/engine/lib/types/general";

/**
 * todo;
 */
export type TSection = string;

/**
 * todo;
 */
export enum EScheme {
  ABUSE = "abuse",
  ACTOR_DIALOGS = "actor_dialogs",
  ANIMPOINT = "animpoint",
  CAMPER = "camper",
  COMBAT = "combat",
  COMBAT_CAMPER = "combat_camper",
  COMBAT_IGNORE = "combat_ignore",
  COMBAT_ZOMBIED = "combat_zombied",
  COMPANION = "companion",
  CORPSE_DETECTION = "corpse_detection",
  COVER = "cover",
  DANGER = "danger",
  DEATH = "death",
  GATHER_ITEMS = "gather_items",
  HEAR = "hear",
  HELI_MOVE = "heli_move",
  HELP_WOUNDED = "help_wounded",
  HIT = "hit",
  MEET = "meet",
  MOB_COMBAT = "mob_combat",
  MOB_DEATH = "mob_death",
  MOB_HOME = "mob_home",
  MOB_JUMP = "mob_jump",
  MOB_REMARK = "mob_remark",
  MOB_WALKER = "mob_walker",
  NIL = "nil",
  PATROL = "patrol",
  PH_BUTTON = "ph_button",
  PH_CODE = "ph_code",
  PH_DOOR = "ph_door",
  PH_FORCE = "ph_force",
  PH_HIT = "ph_hit",
  PH_IDLE = "ph_idle",
  PH_MINIGUN = "ph_minigun",
  PH_ON_DEATH = "ph_on_death",
  PH_ON_HIT = "ph_on_hit",
  PH_OSCILLATE = "ph_oscillate",
  REACH_TASK = "reach_task",
  REMARK = "remark",
  SLEEPER = "sleeper",
  SMARTCOVER = "smartcover",
  SR_CROW_SPAWNER = "sr_crow_spawner",
  SR_CUTSCENE = "sr_cutscene",
  SR_DEIMOS = "sr_deimos",
  SR_IDLE = "sr_idle",
  SR_LIGHT = "sr_light",
  SR_MONSTER = "sr_monster",
  SR_NO_WEAPON = "sr_no_weapon",
  SR_PARTICLE = "sr_particle",
  SR_POSTPROCESS = "sr_postprocess",
  SR_PSY_ANTENNA = "sr_psy_antenna",
  SR_SILENCE = "sr_silence",
  SR_TELEPORT = "sr_teleport",
  SR_TIMER = "sr_timer",
  WALKER = "walker",
  WOUNDED = "wounded",
}

/**
 * todo;
 */
export enum ESchemeType {
  STALKER = 1,
  MONSTER = 2,
  ITEM = 3,
  HELI = 4,
  RESTRICTOR = 5,
}

/**
 * todo;
 */
export enum ESchemeCondition {
  ON_SIGNAL = "on_signal",
  ON_INFO = "on_info",
  ON_TIMER = "on_timer",
  ON_GAME_TIMER = "on_game_timer",
  ON_ACTOR_IN_ZONE = "on_actor_in_zone",
  ON_ACTOR_NOT_IN_ZONE = "on_actor_not_in_zone",
  ON_NPC_IN_ZONE = "on_npc_in_zone",
  ON_NPC_NOT_IN_ZONE = "on_npc_not_in_zone",
  ON_ACTOR_INSIDE = "on_actor_inside",
  ON_ACTOR_OUTSIDE = "on_actor_outside",
  ON_ACTOR_DISTANCE_GREATER_THAN = "on_actor_dist_ge",
  ON_ACTOR_DISTANCE_GREATER_THAN_AND_VISIBLE = "on_actor_dist_ge_nvis",
  ON_ACTOR_DISTANCE_LESS_THAN = "on_actor_dist_le",
  ON_ACTOR_DISTANCE_LESS_THAN_AND_VISIBLE = "on_actor_dist_le_nvis",
}

/**
 * todo;
 */
export enum EJobType {
  PATH_JOB = "path_job",
  POINT_JOB = "point_job",
  SMART_COVER_JOB = "smartcover_job",
}

/**
 * todo;
 */
export const JobTypeByScheme: PartialRecord<EScheme, EJobType> = {
  [EScheme.WALKER]: EJobType.PATH_JOB,
  [EScheme.CAMPER]: EJobType.PATH_JOB,
  [EScheme.PATROL]: EJobType.PATH_JOB,
  [EScheme.ANIMPOINT]: EJobType.SMART_COVER_JOB,
  [EScheme.SMARTCOVER]: EJobType.SMART_COVER_JOB,
  [EScheme.REMARK]: EJobType.POINT_JOB,
  [EScheme.COVER]: EJobType.POINT_JOB,
  [EScheme.SLEEPER]: EJobType.PATH_JOB,
  [EScheme.MOB_WALKER]: EJobType.PATH_JOB,
  [EScheme.MOB_HOME]: EJobType.PATH_JOB,
  [EScheme.MOB_JUMP]: EJobType.POINT_JOB,
  [EScheme.COMPANION]: EJobType.POINT_JOB,
} as const;
