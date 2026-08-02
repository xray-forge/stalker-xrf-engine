import { level } from "xray16";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";

/**
 * Check if currently late night quest time.
 */
extern("xr_conditions.zat_b7_is_night", (): boolean => {
  return $isNotNil(registry.actor) && (level.get_time_hours() >= 23 || level.get_time_hours() < 5);
});
