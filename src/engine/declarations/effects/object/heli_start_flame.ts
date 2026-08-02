import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Start the flame effect on the helicopter bound to the object.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Helicopter game object that starts the flame effect.
 */
extern("xr_effects.heli_start_flame", (_: GameObject, object: GameObject): void => {
  object.get_helicopter().StartFlame();
});
