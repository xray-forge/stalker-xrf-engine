import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Turn on hanging lamp object.
 */
extern("xr_effects.turn_on_object", (_: GameObject, object: GameObject): void => {
  object.get_hanging_lamp().turn_on();
});
