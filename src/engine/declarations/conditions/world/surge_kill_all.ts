import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";

/**
 * Check whether surge is killing all not hided objects at the moment.
 */
extern("xr_conditions.surge_kill_all", (): boolean => {
  return getManager(SurgeManager).isKillingAll();
});
