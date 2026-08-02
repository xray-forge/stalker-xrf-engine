import { extern, isObjectInZone, TStringId } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { takeItemFromActor } from "@/engine/core/utils/reward";
import { spawnObject } from "@/engine/core/utils/spawn";

/**
 * Handle placing scanner in dedicated b32 zones.
 */
extern("xr_effects.jup_b32_place_scanner", (): void => {
  for (const index of $range(1, 5)) {
    const infoPortion: TStringId = "jup_b32_scanner_" + index + "_placed";

    if (
      isObjectInZone(registry.actor, registry.zones.get("jup_b32_sr_scanner_place_" + index)) &&
      !hasInfoPortion(infoPortion)
    ) {
      giveInfoPortion(infoPortion);
      giveInfoPortion(infoPortions.jup_b32_tutorial_done);

      takeItemFromActor(questItems.jup_b32_scanner_device);
      spawnObject("jup_b32_ph_scanner", "jup_b32_scanner_place_" + index);
    }
  }
});
