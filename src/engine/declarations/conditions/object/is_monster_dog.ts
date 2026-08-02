import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isDog } from "@/engine/core/utils/class_ids";

/**
 * Check if object is dog.
 */
extern("xr_conditions.is_monster_dog", (_: GameObject, object: GameObject): boolean => {
  return isDog(object);
});
