import { AnyCallable, extern, getExtern, isObjectInZone } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { zoneNames } from "@/engine/constants/zone_names";
import { registry } from "@/engine/core/database";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveItemsToActor } from "@/engine/core/utils/reward";

/**
 * Give the Zaton b33 safe container item and quest info portion when the actor is in the tutor zone.
 */
extern("xr_effects.zat_b33_pic_snag_container", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get(zoneNames.zat_b33_tutor))) {
    giveItemsToActor(questItems.zat_b33_safe_container);
    giveInfoPortion(infoPortions.zat_b33_find_package);

    // todo: use shared util instead of effect
    if (!hasInfoPortion(infoPortions.zat_b33_safe_container)) {
      getExtern<AnyCallable>("play_sound", getExtern("xr_effects"))(
        registry.actor,
        registry.zones.get(zoneNames.zat_b33_tutor),
        ["pda_news", null, null]
      );
    }
  }
});
