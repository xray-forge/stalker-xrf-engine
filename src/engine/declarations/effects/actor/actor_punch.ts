import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { objectPunchActor } from "@/engine/core/utils/action";

/**
 * Punch actor and force to drop active slot weapon as object.
 */
extern("xr_effects.actor_punch", (_: GameObject, object: GameObject): void => {
  objectPunchActor(object);
});
