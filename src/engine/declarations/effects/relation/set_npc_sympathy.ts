import { GameObject } from "xray16/alias";
import { extern, Nillable, TCount } from "xray16/lib";

import { setObjectSympathy } from "@/engine/core/utils/relation";

/**
 * Set object sympathy level based on provided `sympathy` parameter.
 */
extern("xr_effects.set_npc_sympathy", (_: GameObject, object: GameObject, [sympathy]: [Nillable<TCount>]): void => {
  if (sympathy) {
    setObjectSympathy(object, sympathy);
  }
});
