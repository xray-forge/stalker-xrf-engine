import { GameObject } from "xray16/alias";
import { extern, TRUE } from "xray16/lib";

/**
 * Set sniper fire mode for an object.
 */
extern("xr_effects.sniper_fire_mode", (_: GameObject, object: GameObject, parameters: [string]): void => {
  object.sniper_fire_mode(parameters[0] === TRUE);
});
