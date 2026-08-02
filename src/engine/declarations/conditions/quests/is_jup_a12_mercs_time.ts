import { level } from "xray16";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";

/**
 * Check if currently nighttime suitable for the quest.
 */
extern("xr_conditions.is_jup_a12_mercs_time", (): boolean => {
  return $isNotNil(registry.actor) && level.get_time_hours() >= 1 && level.get_time_hours() < 5;
});
