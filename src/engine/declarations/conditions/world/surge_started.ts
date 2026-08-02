import { extern } from "xray16/lib";

import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";

/**
 * Check whether surge is started at the moment.
 */
extern("xr_conditions.surge_started", (): boolean => {
  return surgeConfig.IS_STARTED;
});
