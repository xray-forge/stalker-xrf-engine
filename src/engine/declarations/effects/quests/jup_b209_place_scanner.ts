import { extern, isObjectInZone } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { zoneNames } from "@/engine/constants/zone_names";
import { registry } from "@/engine/core/database";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { takeItemFromActor } from "@/engine/core/utils/reward";
import { spawnObject } from "@/engine/core/utils/spawn";

/**
 * Place the Jupiter b209 mutant scanner when the actor is in the hypotheses zone and update quest state.
 */
extern("xr_effects.jup_b209_place_scanner", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get(zoneNames.jup_b209_hypotheses))) {
    createGameAutoSave("st_save_jup_b209_placed_mutant_scanner");
    giveInfoPortion(infoPortions.jup_b209_scanner_placed);
    takeItemFromActor(questItems.jup_b209_monster_scanner);
    spawnObject("jup_b209_ph_scanner", "jup_b209_scanner_place_point");
  }
});
