import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isObjectInActorFrustum } from "@/engine/core/utils/position";

/**
 * Checks if object is in actor line of sight frustum.
 */
extern("xr_conditions.npc_in_actor_frustum", (_: GameObject, object: GameObject): boolean => {
  return isObjectInActorFrustum(object);
});
