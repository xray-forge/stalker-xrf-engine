import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

import { nimbleWeapons, TWeapon } from "@/engine/constants/items/weapons";

/**
 * Check if nimble weapon is in one of active actor slots.
 */
extern("xr_conditions.actor_has_active_nimble_weapon", (actor: GameObject): boolean => {
  const first: Nillable<GameObject> = actor.item_in_slot(2);

  if (first && nimbleWeapons[first.section() as TWeapon]) {
    return true;
  }

  const second: Nillable<GameObject> = actor.item_in_slot(3);

  if (second && nimbleWeapons[second.section()]) {
    return true;
  }

  return false;
});
