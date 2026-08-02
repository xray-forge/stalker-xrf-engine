import { extern } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { isWeapon } from "@/engine/core/utils/class_ids";

/**
 * Check if actor has no weapon or is currently talking.
 */
extern("xr_conditions.actor_nomove_nowpn", (): boolean => {
  return !isWeapon(registry.actor.active_item()) || registry.actor.is_talking();
});
