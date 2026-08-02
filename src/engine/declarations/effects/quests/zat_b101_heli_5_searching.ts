import { extern, isObjectInZone } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Give the Zaton b101 helicopter #5 searching info portion when the actor is in the related zone.
 */
extern("xr_effects.zat_b101_heli_5_searching", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("zat_b101_heli_5"))) {
    giveInfoPortion(infoPortions.zat_b101_heli_5_searching);
  }
});
