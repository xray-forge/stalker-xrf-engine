import { AnyCallable, TDuration, TTimestamp } from "@/engine/lib/types";

/**
 * List of event to emit across the core.
 */
export enum EGameEvent {
  /**
   * Actor registered.
   */
  ACTOR_REGISTER,
  /**
   * Actor unregistered.
   */
  ACTOR_UNREGISTER,
  /**
   * Actor spawned after start / load in level and become online.
   */
  ACTOR_SPAWN = 1,
  /**
   * Actor object destroyed and gone offline.
   */
  ACTOR_DESTROY,
  /**
   * Actor update iteration.
   */
  ACTOR_UPDATE,
  /**
   * Actor death.
   */
  ACTOR_DEATH,
  /**
   * Actor info-portions update.
   */
  ACTOR_INFO_UPDATE,
  /**
   * Actor take item from box.
   */
  ACTOR_TAKE_BOX_ITEM,
  /**
   * Actor drop item.
   */
  ACTOR_ITEM_DROP,
  /**
   * Actor take item.
   */
  ACTOR_ITEM_TAKE,
  /**
   * Actor trade happened.
   */
  ACTOR_TRADE,
  /**
   * Actor used item.
   */
  ACTOR_USE_ITEM,
  /**
   * Actor started sleeping.
   */
  ACTOR_START_SLEEP,
  /**
   * Actor finished sleeping.
   */
  ACTOR_FINISH_SLEEP,
  /**
   * Actor first update after load / start.
   */
  ACTOR_FIRST_UPDATE,
  /**
   * On stalker object registered.
   */
  STALKER_REGISTER,
  /**
   * On stalker object unregistered.
   */
  STALKER_UNREGISTER,
  /**
   * On interaction with NPC, when player 'uses' game object.
   */
  STALKER_INTERACTION,
  /**
   * On stalker hit.
   */
  STALKER_HIT,
  /**
   * On stalker killed.
   * Client side death event.
   */
  STALKER_KILLED,
  /**
   * Stalker death.
   * Server side death event.
   */
  STALKER_DEATH,
  /**
   * On monster register.
   */
  MONSTER_REGISTER,
  /**
   * On monster unregister.
   */
  MONSTER_UNREGISTER,
  /**
   * On monster hit.
   */
  MONSTER_HIT,
  /**
   * On monster killed.
   * Client side death event.
   */
  MONSTER_KILLED,
  /**
   * Monster death.
   * Server side death event.
   */
  MONSTER_DEATH,
  /**
   * Registered helicopter server object.
   */
  HELICOPTER_REGISTERED,
  /**
   * Unregistered helicopter server object.
   */
  HELICOPTER_UNREGISTERED,
  /**
   * Registered squad server object.
   */
  SQUAD_REGISTERED,
  /**
   * Unregistered squad server object.
   */
  SQUAD_UNREGISTERED,
  /**
   * Smart terrain registered.
   */
  SMART_TERRAIN_REGISTER,
  /**
   * Smart terrain unregistered.
   */
  SMART_TERRAIN_UNREGISTER,
  /**
   * Registered physic object.
   */
  OBJECT_PHYSIC_REGISTER,
  /**
   * Unregister physic object.
   */
  OBJECT_PHYSIC_UNREGISTER,
  /**
   * Registered hanging lamp object.
   */
  OBJECT_HANGING_LAMP_REGISTER,
  /**
   * Unregister hanging lamp object.
   */
  OBJECT_HANGING_LAMP_UNREGISTER,
  /**
   * Smart cover registered.
   */
  SMART_COVER_REGISTER,
  /**
   * Smart cover unregistered.
   */
  SMART_COVER_UNREGISTER,
  /**
   * Registered zone server object.
   */
  ZONE_REGISTERED,
  /**
   * Unregistered zone server object.
   */
  ZONE_UNREGISTERED,
  /**
   * Registered anomalous zone server object.
   */
  ANOMALOUS_ZONE_REGISTERED,
  /**
   * Unregistered anomalous zone server object.
   */
  ANOMALOUS_ZONE_UNREGISTERED,
  /**
   * Registered restrictor zone server object.
   */
  RESTRICTOR_ZONE_REGISTERED,
  /**
   * Unregistered restrictor zone server object.
   */
  RESTRICTOR_ZONE_UNREGISTERED,
  /**
   * Registered torrid zone server object.
   */
  TORRID_ZONE_REGISTERED,
  /**
   * Unregistered torrid zone server object.
   */
  TORRID_ZONE_UNREGISTERED,
  /**
   * Registered visual zone server object.
   */
  VISUAL_ZONE_REGISTERED,
  /**
   * Unregistered visual zone server object.
   */
  VISUAL_ZONE_UNREGISTERED,
  /**
   * Registered level changer server object.
   */
  LEVEL_CHANGER_REGISTERED,
  /**
   * Unregistered level changer server object.
   */
  LEVEL_CHANGER_UNREGISTERED,
  /**
   * Registered item server object.
   */
  ITEM_REGISTERED,
  /**
   * Unregistered item server object.
   */
  ITEM_UNREGISTERED,
  /**
   * Registered inventory box server object.
   */
  INVENTORY_BOX_REGISTERED,
  /**
   * Unregistered inventory box server object.
   */
  INVENTORY_BOX_UNREGISTERED,
  /**
   * Registered ammo item server object.
   */
  ITEM_AMMO_REGISTERED,
  /**
   * Unregistered ammo item server object.
   */
  ITEM_AMMO_UNREGISTERED,
  /**
   * Registered artefact item server object.
   */
  ITEM_ARTEFACT_REGISTERED,
  /**
   * Unregistered artefact item server object.
   */
  ITEM_ARTEFACT_UNREGISTERED,
  /**
   * Registered detector item server object.
   */
  ITEM_DETECTOR_REGISTERED,
  /**
   * Unregistered detector item server object.
   */
  ITEM_DETECTOR_UNREGISTERED,
  /**
   * Registered eatable item server object.
   */
  ITEM_EATABLE_REGISTERED,
  /**
   * Unregistered eatable item server object.
   */
  ITEM_EATABLE_UNREGISTERED,
  /**
   * Registered explosive item server object.
   */
  ITEM_EXPLOSIVE_REGISTERED,
  /**
   * Unregistered explosive item server object.
   */
  ITEM_GRENADE_UNREGISTERED,
  /**
   * Registered grenade item server object.
   */
  ITEM_GRENADE_REGISTERED,
  /**
   * Unregistered grenade item server object.
   */
  ITEM_GRENADE_UNREGISTERED,
  /**
   * Surge ended.
   */
  SURGE_ENDED,
  /**
   * Surge skipped (happened during sleep or more important events).
   */
  SURGE_SKIPPED,
  /**
   * Surge survived with usage of anabiotic.
   */
  SURGE_SURVIVED_WITH_ANABIOTIC,
  /**
   * Task state updated.
   */
  TASK_STATE_UPDATE,
  /**
   * Task completed.
   */
  TASK_COMPLETED,
  /**
   * Actor found treasure.
   */
  TREASURE_FOUND,
  /**
   * Generic notification event.
   */
  NOTIFICATION,
  /**
   * todo;
   */
  HIT,
  /**
   * Main menu turned on.
   */
  MAIN_MENU_ON,
  /**
   * Main menu turned off.
   */
  MAIN_MENU_OFF,
  /**
   * Game started.
   */
  GAME_STARTED,
  /**
   * Game state save.
   */
  GAME_SAVE,
  /**
   * Game state load.
   */
  GAME_LOAD,
}

/**
 * Descriptor of interval to process on game ticks.
 */
export interface IIntervalDescriptor {
  callback: AnyCallable;
  period: TDuration;
  last: TTimestamp;
}

/**
 * Descriptor of timeout to process on game ticks.
 */
export interface ITimeoutDescriptor {
  callback: AnyCallable;
  delay: TDuration;
  last: TTimestamp;
}
