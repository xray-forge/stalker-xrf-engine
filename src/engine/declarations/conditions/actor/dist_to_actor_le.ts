import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TDistance } from "xray16/lib";

/**
 * Check whether distance between actor and object is less or equal.
 *
 * Where:
 * - distance - number in metres to check.
 */
extern(
  "xr_conditions.dist_to_actor_le",
  (actor: GameObject, object: GameObject, [distance]: [Nillable<TDistance>]): boolean => {
    return distance
      ? object.position().distance_to_sqr(actor.position()) <= distance * distance
      : abort("Wrong parameter in 'dist_to_actor_le' function: '%s'.", distance);
  }
);
