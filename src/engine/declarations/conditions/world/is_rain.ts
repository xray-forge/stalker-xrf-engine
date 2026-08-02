import { level } from "xray16";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";

/**
 * Check whether it is rainy in the game at the moment.
 */
extern("xr_conditions.is_rain", (): boolean => {
  return $isNotNil(registry.actor) && level.rain_factor() > 0;
});
