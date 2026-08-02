import { GameObject } from "xray16/alias";
import { extern, Nillable, TRate } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

/**
 * Check if object health is less than provided value.
 *
 * Where:
 * - health - number value between 0 and 1 to check against.
 */
extern("xr_conditions.health_le", (_: GameObject, object: GameObject, [health]: [Nillable<TRate>]): boolean => {
  return $isNotNil(health) && object.health < health;
});
