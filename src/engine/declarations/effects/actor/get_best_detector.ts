import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

import { detectorsOrder } from "@/engine/constants/items/detectors";

/**
 * Force actor to use detector if any exists in inventory.
 */
extern("xr_effects.get_best_detector", (actor: GameObject): void => {
  for (const [, detector] of ipairs(detectorsOrder)) {
    const item: Nillable<GameObject> = actor.object(detector);

    if (item) {
      item.enable_attachable_item(true);

      return;
    }
  }
});
