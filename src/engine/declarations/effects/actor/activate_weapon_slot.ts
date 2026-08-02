import { GameObject } from "xray16/alias";
import { assert, extern, Nillable } from "xray16/lib";

import { EActiveItemSlot } from "@/engine/core/managers/actor";

/**
 * Set weapon slot as currently active for actor.
 */
extern(
  "xr_effects.activate_weapon_slot",
  (actor: GameObject, __: GameObject, [slot]: [Nillable<EActiveItemSlot>]): void => {
    assert(slot, "Expected weapon slot to be provided as parameter in effect 'activate_weapon_slot'.");
    actor.activate_slot(slot);
  }
);
