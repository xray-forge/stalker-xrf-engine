import { danger_object } from "xray16";

export const dangerConfig = {
  INERTIA_TIME: 15_000,
  IGNORE_DISTANCE_GENERAL: 150,
  IGNORE_DISTANCE_GENERAL_SQR: 150 * 150,
  IGNORE_DISTANCE_BY_TYPE: {
    [danger_object.grenade]: 15,
    [danger_object.entity_corpse]: 10,
    [danger_object.entity_attacked]: 150,
    [danger_object.attacked]: 150,
    [danger_object.bullet_ricochet]: 2,
    [danger_object.enemy_sound]: 0,
    [danger_object.attack_sound]: 20,
    [danger_object.entity_death]: 10,
  },
};
