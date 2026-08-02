import { GameObject } from "xray16/alias";
import { extern, Nillable, TSection } from "xray16/lib";

/**
 * Check if one of provided items is active in slot 3 of actor.
 */
extern("xr_conditions.active_item", (actor: GameObject, __: GameObject, parameters: Array<TSection>): boolean => {
  const item: Nillable<GameObject> = actor.item_in_slot(3);

  if (item) {
    for (const [, section] of ipairs(parameters)) {
      if (item && item.section() === section) {
        return true;
      }
    }
  }

  return false;
});
