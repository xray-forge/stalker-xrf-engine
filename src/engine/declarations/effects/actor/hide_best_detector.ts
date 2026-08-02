import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

import { detectorsOrder } from "@/engine/constants/items/detectors";

/**
 * Hide actor detector if it is active item.
 */
extern("xr_effects.hide_best_detector", (actor: GameObject): void => {
  for (const [, detector] of ipairs(detectorsOrder)) {
    const item: Nillable<GameObject> = actor.object(detector);

    if (item) {
      item.enable_attachable_item(false);

      return;
    }
  }
});
