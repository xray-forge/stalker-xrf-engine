import { extern } from "xray16/lib";

import { updateAnomalyZonesDisplay } from "@/engine/core/managers/map/utils";

/**
 * Force update of pda zones display.
 */
extern("xr_effects.jup_b32_pda_check", (): void => {
  updateAnomalyZonesDisplay();
});
