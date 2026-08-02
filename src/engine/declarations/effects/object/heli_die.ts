import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { unregisterHelicopterFromList } from "@/engine/core/database";

/**
 * Destroy the helicopter bound to the object and remove it from the helicopters list.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Helicopter game object that is destroyed.
 */
extern("xr_effects.heli_die", (_: GameObject, object: GameObject): void => {
  object.get_helicopter().Die();
  unregisterHelicopterFromList(object);
});
