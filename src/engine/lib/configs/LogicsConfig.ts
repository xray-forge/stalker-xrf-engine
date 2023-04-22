import { danger_object } from "xray16";

import { TDuration } from "@/engine/lib/types";

/**
 * todo;
 */
export const logicsConfig = {
  ACTOR_VISIBILITY_FRUSTUM: 35,
  DANGER_INERTION_TIME: 30_000,
  DANGER_IGNORE_DISTANCE_GENERAL: 150,
  DANGER_IGNORE_DISTANCE_BY_TYPE: {
    [danger_object.grenade]: 15,
    [danger_object.entity_corpse]: 10,
    [danger_object.entity_attacked]: 150,
    [danger_object.attacked]: 150,
    [danger_object.bullet_ricochet]: 2,
    [danger_object.enemy_sound]: 0,
    [danger_object.attack_sound]: 20,
    [danger_object.entity_death]: 4,
  },
  /**
   * Distance to travel from object to forget about meeting state and say hello again.
   */
  MEET_RESET_DISTANCE: 30,
  ITEMS: {
    DROPPED_WEAPON_STATE_DEGRADATION: {
      MIN: 40,
      MAX: 80,
    },
  },
  POST_COMBAT_IDLE: {
    MIN: 5_000,
    MAX: 15_000,
  },
  SQUAD: {
    STAY_POINT_IDLE_MIN: 180 * 60,
    STAY_POINT_IDLE_MAX: 300 * 60,
  },
  SMART_TERRAIN: {
    /**
     * Timeout for smart terrain controlled base (like Yanov).
     */
    ALARM_SMART_TERRAIN_BASE: 2 * 60 * 60,
    /**
     * Timeout for smart terrain generic alarm.
     */
    ALARM_SMART_TERRAIN_GENERIC: 6 * 60 * 60,
    /**
     * Throttle updates on death.
     */
    DEATH_IDLE_TIME: 600,
    /**
     * Time between respawn attempts for smart terrain.
     */
    RESPAWN_IDLE: 1_000,
    /**
     * Restrict spawn of objects in radius.
     */
    RESPAWN_RADIUS_RESTRICTION: 150,
    RESPAWN_RADIUS_RESTRICTION_SQR: 150 * 150,
    DEFAULT_ARRIVAL_DISTANCE: 25,
  },
} as const;
