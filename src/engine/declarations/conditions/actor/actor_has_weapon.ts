import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isWeapon } from "@/engine/core/utils/class_ids";

/**
 * Check if actor has any active weapon.
 */
extern("xr_conditions.actor_has_weapon", (actor: GameObject): boolean => {
  return isWeapon(actor.active_item());
});
