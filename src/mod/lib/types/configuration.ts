/**
 * todo;
 */
export type TScheme = string;

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
  HELI_MOVE = "heli_move",
  HELP_WOUNDED = "help_wounded",
  HIT = "hit",
  KAMP = "kamp",
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
  STALKER = 0,
  MOBILE = 1,
  ITEM = 2,
  HELI = 3,
  RESTRICTOR = 4,
}
