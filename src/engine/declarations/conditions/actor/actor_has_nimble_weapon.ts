import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { nimbleWeapons } from "@/engine/constants/items/weapons";

/**
 * Check if actor has one of nimble weapons.
 */
extern("xr_conditions.actor_has_nimble_weapon", (actor: GameObject): boolean => {
  for (const [weapon] of pairs(nimbleWeapons)) {
    if (actor.object(weapon)) {
      return true;
    }
  }

  return false;
});
