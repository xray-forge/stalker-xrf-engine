import { extern } from "xray16/lib";

import { hasAchievedWealthy } from "@/engine/core/utils/achievements";

/**
 * Check whether `wealthy` achievement criteria is achieved.
 * By default, requires actor to have 100k money value.
 */
extern("xr_conditions.wealthy_functor", (): boolean => {
  return hasAchievedWealthy();
});
