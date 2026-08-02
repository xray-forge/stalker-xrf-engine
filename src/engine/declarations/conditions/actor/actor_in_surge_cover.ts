import { extern } from "xray16/lib";

import { isActorInSurgeCover } from "@/engine/core/managers/surge/utils/surge_cover";

/**
 * Check whether actor is currently in surge cover zone.
 */
extern("xr_conditions.actor_in_surge_cover", (): boolean => {
  return isActorInSurgeCover();
});
