import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Force burer anti aim force.
 */
extern("xr_effects.burer_force_anti_aim", (_: GameObject, object: GameObject): void => {
  object.set_force_anti_aim(true);
});
