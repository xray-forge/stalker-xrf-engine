import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Restore the object health to full.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object whose health is restored.
 */
extern("xr_effects.restore_health", (_: GameObject, object: GameObject): void => {
  object.health = 1;
});
