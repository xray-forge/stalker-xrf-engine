import { GameObject } from "xray16/alias";
import { extern, isDistanceBetweenObjectsGreaterOrEqual, TDistance } from "xray16/lib";

/**
 * Check if distance between actor and object greater or equal.
 *
 * Where:
 * - distance - number to check against.
 */
extern("xr_conditions.fighting_dist_ge", (actor: GameObject, object: GameObject, [distance]: [TDistance]): boolean => {
  return isDistanceBetweenObjectsGreaterOrEqual(actor, object, distance);
});
