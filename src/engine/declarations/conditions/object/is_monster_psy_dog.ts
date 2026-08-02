import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isPsyDog } from "@/engine/core/utils/class_ids";

/**
 * Check if object is psy dog.
 */
extern("xr_conditions.is_monster_psy_dog", (_: GameObject, object: GameObject): boolean => {
  return isPsyDog(object);
});
