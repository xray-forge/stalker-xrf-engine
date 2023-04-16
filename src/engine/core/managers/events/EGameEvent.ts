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
   * Surge ended.
   */
  SURGE_ENDED,
  /**
   * Surge skipped (happened during sleep or more important events).
   */
  SURGE_SKIPPED,
  /**
   * Task state updated.
   */
  TASK_STATE_UPDATE,
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
  NPC_INTERACTION,
  /**
   * todo;
   */
  MONSTER_HIT,
  /**
   * todo;
   */
  NPC_HIT,
  /**
   * todo;
   */
  ENEMY_SEE_ACTOR,
  /**
   * todo;
   */
  ACTOR_SEE_ENEMY,
  /**
   * todo;
   */
  NPC_SHOT_ACTOR,
  /**
   * Main menu turned on.
   */
  MAIN_MENU_ON,
  /**
   * Main menu turned off.
   */
  MAIN_MENU_OFF,
}
