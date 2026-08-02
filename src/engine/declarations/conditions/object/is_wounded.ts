import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isObjectWounded } from "@/engine/core/utils/planner";

/**
 * Check if object is currently wounded and using wounded scheme.
 */
extern("xr_conditions.is_wounded", (_: GameObject, object: GameObject): boolean => {
  return isObjectWounded(object.id());
});
