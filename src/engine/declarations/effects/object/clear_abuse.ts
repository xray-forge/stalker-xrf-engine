import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { clearObjectAbuse } from "@/engine/core/schemes/stalker/meet/utils";

/**
 * Clear abuse for provided object.
 */
extern("xr_effects.clear_abuse", (_: GameObject, object: GameObject): void => {
  clearObjectAbuse(object);
});
