import { extern, isObjectInZone } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { zoneNames } from "@/engine/constants/zone_names";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Check if actor is in zone and force generators start.
 */
extern("xr_effects.pri_b306_generator_start", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get(zoneNames.pri_b306_sr_generator))) {
    giveInfoPortion(infoPortions.pri_b306_lift_generator_used);
  }
});
