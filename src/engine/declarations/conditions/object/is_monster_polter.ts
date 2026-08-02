import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isPoltergeist } from "@/engine/core/utils/class_ids";

/**
 * Check if object is poltergeist.
 */
extern("xr_conditions.is_monster_polter", (_: GameObject, object: GameObject): boolean => {
  return isPoltergeist(object);
});
