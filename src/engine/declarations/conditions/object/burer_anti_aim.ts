import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Check if burer uses anti-aim force.
 */
extern("xr_conditions.burer_anti_aim", (_: GameObject, object: GameObject): boolean => {
  return object.get_force_anti_aim();
});
