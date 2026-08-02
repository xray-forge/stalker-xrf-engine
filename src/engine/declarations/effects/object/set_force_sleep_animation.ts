import { GameObject } from "xray16/alias";
import { extern, TDuration } from "xray16/lib";

/**
 * Force the object to play the stand sleep animation for the provided duration.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object that plays the sleep animation.
 * @param duration - Duration of the forced sleep animation.
 */
extern("xr_effects.set_force_sleep_animation", (_: GameObject, object: GameObject, [duration]: [TDuration]): void => {
  object.force_stand_sleep_animation(tonumber(duration) as TDuration);
});
