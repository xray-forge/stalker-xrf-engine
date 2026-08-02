import { GameObject } from "xray16/alias";
import { extern, isDistanceBetweenObjectsLessOrEqual, TDistance } from "xray16/lib";

/**
 * Check if distance between actor and object less or equal.
 *
 * Where:
 * - distance - number to check against.
 */
extern("xr_conditions.fighting_dist_le", (actor: GameObject, object: GameObject, [distance]: [TDistance]): boolean => {
  return isDistanceBetweenObjectsLessOrEqual(actor, object, distance);
});
