import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isController } from "@/engine/core/utils/class_ids";

/**
 * Check if object is controller.
 */
extern("xr_conditions.is_monster_controller", (_: GameObject, object: GameObject): boolean => {
  return isController(object);
});
