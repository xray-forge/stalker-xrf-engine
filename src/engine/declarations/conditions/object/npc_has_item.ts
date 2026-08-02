import { GameObject } from "xray16/alias";
import { extern, Nillable, TSection } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

/**
 * Whether object has item in inventory.
 */
extern("xr_conditions.npc_has_item", (_: GameObject, object: GameObject, [section]: [Nillable<TSection>]): boolean => {
  return $isNotNil(section) && $isNotNil(object.object(section));
});
