import { GameObject } from "xray16/alias";
import { extern, Nillable, TRate } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

/**
 * Check whether actor health is less than provided value.
 *
 * Where:
 * - health - number in from 0 to 1 to check.
 */
extern("xr_conditions.actor_health_le", (actor: GameObject, __: GameObject, [health]: [Nillable<TRate>]): boolean => {
  return $isNotNil(health) && actor.health < health;
});
