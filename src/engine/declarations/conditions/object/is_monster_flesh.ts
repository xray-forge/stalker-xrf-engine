import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isFlesh } from "@/engine/core/utils/class_ids";

/**
 * Check if object is flesh.
 */
extern("xr_conditions.is_monster_flesh", (_: GameObject, object: GameObject): boolean => {
  return isFlesh(object);
});
