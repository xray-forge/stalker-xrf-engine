import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Whether object is alive and see actor.
 */
extern("xr_conditions.see_actor", (actor: GameObject, object: GameObject): boolean => {
  return object.alive() && object.see(actor);
});
