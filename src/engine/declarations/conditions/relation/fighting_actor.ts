import { GameObject } from "xray16/alias";
import { ACTOR_ID, extern } from "xray16/lib";

import { registry } from "@/engine/core/database";

/**
 * Check whether object is in combat and fighting actor.
 */
extern("xr_conditions.fighting_actor", (_: GameObject, object: GameObject): boolean => {
  return registry.objects.get(object.id()).enemyId === ACTOR_ID;
});
