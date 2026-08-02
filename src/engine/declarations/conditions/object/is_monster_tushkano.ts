import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isTushkano } from "@/engine/core/utils/class_ids";

/**
 * Check if object is tushkano.
 */
extern("xr_conditions.is_monster_tushkano", (_: GameObject, object: GameObject): boolean => {
  return isTushkano(object);
});
