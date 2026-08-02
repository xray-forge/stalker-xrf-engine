import { extern, isObjectInZone } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Give the Zaton b28 helicopter #3 searching info portion when the actor is in the related zone.
 */
extern("xr_effects.zat_b28_heli_3_searching", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("zat_b28_heli_3"))) {
    giveInfoPortion(infoPortions.zat_b28_heli_3_searching);
  }
});
