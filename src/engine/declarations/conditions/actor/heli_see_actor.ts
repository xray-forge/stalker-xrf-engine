import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

/**
 * Check if helicopter sees actor.
 */
extern("xr_conditions.heli_see_actor", (actor: GameObject, object: GameObject): boolean => {
  return $isNotNil(actor) && object.get_helicopter().isVisible(actor);
});
