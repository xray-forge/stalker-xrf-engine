import { extern, isObjectInZone } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { zoneNames } from "@/engine/constants/zone_names";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Give the Pripyat a18 run camera info portion when the actor is in the idol restrictor zone.
 */
extern("xr_effects.pri_a18_use_idol", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get(zoneNames.pri_a18_use_idol_restrictor))) {
    giveInfoPortion(infoPortions.pri_a18_run_cam);
  }
});
