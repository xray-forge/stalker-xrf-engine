import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";

/**
 * Request stop of surge.
 */
extern("xr_effects.stop_surge", (): void => {
  getManager(SurgeManager).requestSurgeStop();
});
