import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";

/**
 * Request start of surge.
 */
extern("xr_effects.start_surge", (): void => {
  getManager(SurgeManager).requestSurgeStart();
});
