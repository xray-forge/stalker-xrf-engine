import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

/**
 * Check whether actor is alive at the moment.
 */
extern("xr_conditions.actor_alive", (actor: GameObject): boolean => {
  return actor.alive();
});
