import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";

/**
 * Check whether current game minutes are within shift period (gets module from minutes and check <= period).
 *
 * Where:
 * - shift - time shift
 * - period - time period.
 */
extern(
  "xr_conditions.time_period",
  (_: GameObject, __: GameObject, [shift, period]: [Nillable<number>, Nillable<number>]): boolean => {
    if (shift && period && $isNotNil(registry.actor)) {
      return shift > period && level.get_time_minutes() % shift <= period;
    }

    return false;
  }
);
