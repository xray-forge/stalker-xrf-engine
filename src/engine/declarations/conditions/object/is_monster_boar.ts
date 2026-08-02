import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isBoar } from "@/engine/core/utils/class_ids";

/**
 * Check if object is boar.
 */
extern("xr_conditions.is_monster_boar", (_: GameObject, object: GameObject): boolean => {
  return isBoar(object);
});
