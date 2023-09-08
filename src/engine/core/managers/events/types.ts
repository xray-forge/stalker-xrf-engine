import { AnyCallable, TDuration, TTimestamp } from "@/engine/lib/types";

/**
 * List of event to emit across the core.
 */
export enum EGameEvent {
  /**
   * Actor spawned after start / load in level.
   */
  ACTOR_NET_SPAWN = 1,
  /**
   * Actor object destroyed.
   */
  ACTOR_NET_DESTROY,
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
  /**
   * Registered zone server object.
   */
  ZONE_REGISTERED,
  /**
   * Registered zone server object.
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
   * Registered torrid zone server object.
   */
  TORRID_ZONE_UNREGISTERED,
  /**
   * Registered visual zone server object.
   */
  VISUAL_ZONE_REGISTERED,
  /**
   * Registered visual zone server object.
   */
  VISUAL_ZONE_UNREGISTERED,
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
