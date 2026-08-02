import { extern, isObjectInZone } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { zoneNames } from "@/engine/constants/zone_names";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { giveItemsToActor } from "@/engine/core/utils/reward";

/**
 * Start the Jupiter b10 UFO memory quest and give the memory item when the actor is in the related zone.
 */
extern("xr_effects.jup_b10_ufo_searching", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get(zoneNames.jup_b10_ufo_restrictor))) {
    giveInfoPortion(infoPortions.jup_b10_ufo_memory_started);
    giveItemsToActor(questItems.jup_b10_ufo_memory);
  }
});
