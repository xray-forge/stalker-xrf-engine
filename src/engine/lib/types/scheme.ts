import type { TCount, TIndex, TName } from "@/engine/lib/types/alias";
import type { Optional } from "@/engine/lib/types/general";
import type { GameObject, Vector } from "@/engine/lib/types/xray";

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
  POST_COMBAT_IDLE = "post_combat_idle",
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
  // Stalker object scheme.
  STALKER = 1,
  // Monster object scheme.
  MONSTER = 2,
  // Object object scheme.
  OBJECT = 3,
  // Helicopter object scheme.
  HELICOPTER = 4,
  // Zone / restrictor scheme.
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

/**
 * Generic scheme logics events to get callbacks from schemeManager subscribers.
 */
export enum ESchemeEvent {
  ACTIVATE = "activate",
  DEACTIVATE = "deactivate",
  SAVE = "save",
  UPDATE = "update",
  DEATH = "onDeath",
  CUTSCENE = "onCutscene",
  EXTRAPOLATE = "onExtrapolate",
  SWITCH_ONLINE = "onSwitchOnline",
  SWITCH_OFFLINE = "onSwitchOffline",
  HIT = "onHit",
  USE = "onUse",
  COMBAT = "onCombat",
  WAYPOINT = "onWaypoint",
}

/**
 * Interface implementing scheme events handler.
 * Simplifies handling of scheme signals.
 */
export interface ISchemeEventHandler {
  /**
   * todo: Swap params order.
   *
   * Handle schema activation event.
   *
   * @param object - target game object activation happen for
   * @param isLoading - whether activation happen on load or during active game
   */
  activate?(object: GameObject, isLoading: boolean): void;
  /**
   * Handle schema deactivation event.
   *
   * @param object - target game object deactivation happen for
   */
  deactivate?(object: GameObject): void;
  /**
   * Handle game update event inside the schema.
   *
   * @param delta - time since last update tick
   */
  update?(delta: TCount): void;
  /**
   * Handle save event inside the schema.
   * Usually data being stored in portable state or dynamic save.
   */
  save?(): void;
  /**
   * Handle going online by game object.
   *
   * @param object - target game object going online
   */
  onSwitchOnline?(object: GameObject): void;
  /**
   * Handle going offline by game object.
   *
   * @param object - target game object going offline
   */
  onSwitchOffline?(object: GameObject): void;
  /**
   * Handle scheme hit callback.
   * Emits when objects are hit by something.
   *
   * @param object - target game object being hit
   * @param amount - amount of hit applied
   * @param direction - direction of hit
   * @param who - game object which is source of hit
   * @param boneIndex - index of bone being hit
   */
  onHit?(object: GameObject, amount: TCount, direction: Vector, who: Optional<GameObject>, boneIndex: TIndex): void;
  /**
   * Handle scheme use event.
   *
   * @param object - target game object being used
   * @param who - game object using target object
   */
  onUse?(object: GameObject, who: Optional<GameObject>): void;
  /**
   * Handle scheme waypoint moving event.
   *
   * @param object - target game object moving on waypoints
   * @param actionType - type of action in the waypoint
   * @param index - index of the waypoint in patrol
   */
  onWaypoint?(object: GameObject, actionType: TName, index: TIndex): void;
  /**
   * Handle scheme death callback.
   * Emits when objects are dying.
   *
   * @param victim - target game object dying
   * @param who - game object who killed the object
   */
  onDeath?(victim: GameObject, who: Optional<GameObject>): void;
  /**
   * Handle scheme cutscene progression event.
   */
  onCutscene?(): void;
  /**
   * Handle scheme combat start event.
   */
  onCombat?(): void;
}
