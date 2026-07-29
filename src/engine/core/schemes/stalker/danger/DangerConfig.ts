import { danger_object } from "xray16";

export const dangerConfig = {
  INERTIA_TIME: 15_000,
  IGNORE_DISTANCE_GENERAL: 150,
  IGNORE_DISTANCE_GENERAL_SQR: 150 * 150,
  /**
   * Maximal squared distance in meters to react on danger of specific type.
   * Danger types missing here fall back to `IGNORE_DISTANCE_GENERAL_SQR`, `0` disables reaction completely.
   */
  IGNORE_DISTANCE_BY_TYPE_SQR: {
    [danger_object.grenade]: 30 * 30,
    [danger_object.entity_corpse]: 10 * 10,
    [danger_object.entity_attacked]: 150 * 150,
    [danger_object.attacked]: 150 * 150,
    [danger_object.bullet_ricochet]: 50 * 50,
    [danger_object.enemy_sound]: 40 * 40,
    [danger_object.attack_sound]: 100 * 100,
    [danger_object.entity_death]: 50 * 50,
  },
};
