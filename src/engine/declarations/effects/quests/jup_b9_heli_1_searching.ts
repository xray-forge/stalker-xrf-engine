import { extern, isObjectInZone } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { zoneNames } from "@/engine/constants/zone_names";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Give the Jupiter b9 helicopter #1 searching info portion when the actor is in the related zone.
 */
extern("xr_effects.jup_b9_heli_1_searching", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get(zoneNames.jup_b9_heli_1))) {
    giveInfoPortion(infoPortions.jup_b9_heli_1_searching);
  }
});
