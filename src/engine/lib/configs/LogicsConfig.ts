import { danger_object } from "xray16";

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
} as const;
