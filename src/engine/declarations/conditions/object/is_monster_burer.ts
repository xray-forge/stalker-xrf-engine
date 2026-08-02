import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isBurer } from "@/engine/core/utils/class_ids";

/**
 * Check if object is burer.
 */
extern("xr_conditions.is_monster_burer", (_: GameObject, object: GameObject): boolean => {
  return isBurer(object);
});
