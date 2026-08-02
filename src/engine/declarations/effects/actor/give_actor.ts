import { GameObject } from "xray16/alias";
import { extern, Nillable, TSection } from "xray16/lib";

import { giveItemsToActor } from "@/engine/core/utils/reward";

/**
 * Give items of provided section to actor.
 * Expects variadic list of sections to give for the actor.
 */
extern("xr_effects.give_actor", (_: GameObject, __: Nillable<GameObject>, sections: Array<TSection>): void => {
  for (const section of sections) {
    giveItemsToActor(section);
  }
});
