import { level } from "xray16";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";

/**
 * Check if currently late attack quest time.
 */
extern("xr_conditions.zat_b7_is_late_attack_time", (): boolean => {
  return $isNotNil(registry.actor) && (level.get_time_hours() >= 23 || level.get_time_hours() < 9);
});
