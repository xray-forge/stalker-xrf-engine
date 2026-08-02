import { level } from "xray16";
import { extern, TTimestamp } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";

/**
 * Check whether it is dark nighttime in the game at the moment.
 */
extern("xr_conditions.is_dark_night", (): boolean => {
  const timeHours: TTimestamp = level.get_time_hours();

  return $isNotNil(registry.actor) && (timeHours < 3 || timeHours > 22);
});
