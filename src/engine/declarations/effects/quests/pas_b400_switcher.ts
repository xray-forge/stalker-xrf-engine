import { extern, isObjectInZone } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { zoneNames } from "@/engine/constants/zone_names";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Handle usage of b400 passage switcher.
 */
extern("xr_effects.pas_b400_switcher", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get(zoneNames.pas_b400_sr_switcher))) {
    giveInfoPortion(infoPortions.pas_b400_switcher_use);
  }
});
