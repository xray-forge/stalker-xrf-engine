import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Check whether actor sees object at the moment.
 */
extern("xr_conditions.actor_see_npc", (actor: GameObject, object: GameObject): boolean => {
  return actor.see(object);
});
