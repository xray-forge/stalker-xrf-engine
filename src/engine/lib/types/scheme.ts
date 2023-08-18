import type { PartialRecord } from "@/engine/lib/types/general";

/**
 * Section name string, representing string256 in c++.
 */
export type TSection = string;

/**
 * Enumeration describing possible game logics schemes.
 * Scheme allows to handle scripted behaviour with sharable logics components.
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
 * Applied scheme type.
 * Describes with what object type scheme logic works.
 */
export enum ESchemeType {
  STALKER = 1,
  MONSTER = 2,
  ITEM = 3,
  HELI = 4,
  RESTRICTOR = 5,
}

/**
 * Scheme conditions enum for active section toggling.
 */
export enum ESchemeCondition {
  // Check whether some scheme signal is received and activated.
  ON_SIGNAL = "on_signal",
  // Check whether info portions are matching in condlist (executes section pick from condlist).
  ON_INFO = "on_info",
  // Check whether desired time passed since already applied scheme activation, expects milliseconds.
  ON_TIMER = "on_timer",
  // Check whether desired time passed in game world, expects in-game seconds.
  ON_GAME_TIMER = "on_game_timer",
  // Check whether actor is in zone by zone name.
  ON_ACTOR_IN_ZONE = "on_actor_in_zone",
  // Check whether actor is not in zone by zone name.
  ON_ACTOR_NOT_IN_ZONE = "on_actor_not_in_zone",
  // Check whether NPC is in zone by zone name.
  ON_NPC_IN_ZONE = "on_npc_in_zone",
  // Check whether NPC is not in zone by zone name.
  ON_NPC_NOT_IN_ZONE = "on_npc_not_in_zone",
  // Check whether actor is in object restrictor.
  ON_ACTOR_INSIDE = "on_actor_inside",
  // Check whether actor is outside of object restrictor.
  ON_ACTOR_OUTSIDE = "on_actor_outside",
  // Check whether object see actor + distance is greater/equal than parameter, assumes object is alive.
  ON_ACTOR_DISTANCE_GREATER_THAN = "on_actor_dist_ge",
  // Check whether distance is greater/equal than parameter, do not check visibility or object state.
  ON_ACTOR_DISTANCE_GREATER_THAN_NOT_VISIBLE = "on_actor_dist_ge_nvis",
  // Check whether object see actor + distance is less/equal than parameter, assumes object is alive.
  ON_ACTOR_DISTANCE_LESS_THAN = "on_actor_dist_le",
  // Check whether distance is less/equal than parameter, do not check visibility or object state.
  ON_ACTOR_DISTANCE_LESS_THAN_NOT_VISIBLE = "on_actor_dist_le_nvis",
}
