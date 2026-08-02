import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { TInfoPortion } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Check if actor has b16 zone info portion.
 */
extern("xr_conditions.jup_b16_is_zone_active", (_: GameObject, object: GameObject): boolean => {
  return hasInfoPortion(object.name() as TInfoPortion);
});
