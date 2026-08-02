import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Clear animation of monster object.
 */
extern("xr_effects.clear_monster_animation", (_: GameObject, object: GameObject): void => {
  object.clear_override_animation();
});
