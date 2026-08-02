import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Release sleep animation of the object.
 */
extern("xr_effects.release_force_sleep_animation", (_: GameObject, object: GameObject): void => {
  object.release_stand_sleep_animation();
});
