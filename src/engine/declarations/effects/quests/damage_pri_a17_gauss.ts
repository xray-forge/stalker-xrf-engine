import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

import { questItems } from "@/engine/constants/items/quest_items";
import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Set the condition of the Pripyat a17 gauss rifle to zero, breaking it.
 */
extern("xr_effects.damage_pri_a17_gauss", (): void => {
  const object: Nillable<GameObject> = getObjectByStoryId(questItems.pri_a17_gauss_rifle);

  if (object) {
    object.set_condition(0.0);
  }
});
