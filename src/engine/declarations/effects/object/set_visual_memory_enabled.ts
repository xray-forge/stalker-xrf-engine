import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

/**
 * Toggle visual memory of the object based on the provided boolean-like value.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object whose visual memory is toggled.
 * @param p - Tuple containing a value of 0 or 1 to disable or enable visual memory.
 */
extern("xr_effects.set_visual_memory_enabled", (_: GameObject, object: GameObject, p: [number]): void => {
  if (p && $isNotNil(p[0]) && tonumber(p[0])! >= 0 && tonumber(p[0])! <= 1) {
    object.set_visual_memory_enabled(tonumber(p[0]) === 1);
  }
});
