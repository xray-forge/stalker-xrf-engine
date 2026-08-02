import { extern } from "xray16/lib";

import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";

/**
 * Check whether surge is completed at the moment.
 */
extern("xr_conditions.surge_complete", (): boolean => {
  return surgeConfig.IS_FINISHED;
});
