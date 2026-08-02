import { GameObject } from "xray16/alias";
import { AnyCallable, extern, getExtern, isObjectInZone } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { giveItemsToActor } from "@/engine/core/utils/reward";

/**
 * Todo: Simplify with utils for object destruction.
 */
extern("xr_effects.jup_b206_get_plant", (_: GameObject, object: GameObject): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("jup_b206_sr_quest_line"))) {
    giveInfoPortion(infoPortions.jup_b206_anomalous_grove_has_plant);
    giveItemsToActor(questItems.jup_b206_plant);

    getExtern<AnyCallable>("destroy_object", getExtern("xr_effects"))(registry.actor, object, [
      "story",
      "jup_b206_plant_ph",
      null,
    ]);
  }
});
