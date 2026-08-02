import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Check if burer uses gravi attack.
 */
extern("xr_conditions.burer_gravi_attack", (_: GameObject, object: GameObject): boolean => {
  return object.burer_get_force_gravi_attack();
});
