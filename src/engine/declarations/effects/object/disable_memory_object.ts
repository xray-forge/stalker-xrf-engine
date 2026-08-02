import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

/**
 * Disable memory of the object's current best enemy so it stops being remembered.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object whose best enemy memory is disabled.
 */
extern("xr_effects.disable_memory_object", (_: GameObject, object: GameObject): void => {
  const bestEnemy: Nillable<GameObject> = object.best_enemy();

  if (bestEnemy) {
    object.enable_memory_object(bestEnemy, false);
  }
});
