import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Force burer gravity attack as enabled.
 */
extern("xr_effects.burer_force_gravi_attack", (_: GameObject, object: GameObject): void => {
  object.burer_set_force_gravi_attack(true);
});
