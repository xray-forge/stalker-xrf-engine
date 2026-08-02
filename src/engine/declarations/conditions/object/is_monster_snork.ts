import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isSnork } from "@/engine/core/utils/class_ids";

/**
 * Check if object is snork.
 */
extern("xr_conditions.is_monster_snork", (_: GameObject, object: GameObject): boolean => {
  return isSnork(object);
});
