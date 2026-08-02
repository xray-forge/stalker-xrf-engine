import { GameObject } from "xray16/alias";
import { extern, Nillable, TSection } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

/**
 * Check if actor has specific item in inventory.
 *
 * Where:
 * - section - item section to check.
 */
extern(
  "xr_conditions.actor_has_item",
  (actor: GameObject, __: GameObject, [section]: [Nillable<TSection>]): boolean => {
    return $isNotNil(section) && $isNotNil(actor) && $isNotNil(actor.object(section));
  }
);
