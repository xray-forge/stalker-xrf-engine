import { game, level } from "xray16";

import { getObjectIdByStoryId } from "@/engine/core/database";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { getAnomalyArtefacts } from "@/engine/core/utils/anomaly";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { mapMarks } from "@/engine/lib/constants/map_marks";
import { LuaArray, Optional, TLabel, TNumberId, TSection } from "@/engine/lib/types";

/**
 * Update hints display for anomaly zones.
 * Show count of artefacts on map spots if related quests are finished.
 *
 * By default, there is 2 quests enabling 5 zones scanners placement.
 *
 * Note:
 *  - Called on first init
 *  - Called when artefacts respawn
 *  - Called on artefact pickup
 */
export function updateAnomalyZonesDisplay(): void {
  if (!hasInfoPortion(infoPortions.jup_b32_scanner_reward)) {
    return;
  }

  /**
   * Update artefacts loot display in zones with artefacts.
   * Works for jupiter only.
   */
  for (const [, descriptor] of mapDisplayConfig.SCANNER_SPOTS) {
    if (!hasInfoPortion(descriptor.group)) {
      continue;
    }

    const objectId: Optional<TNumberId> = getObjectIdByStoryId(descriptor.target);

    if (objectId && level.map_has_object_spot(objectId, mapMarks.primary_object) !== 0) {
      const anomalyArtefacts: LuaArray<TSection> = getAnomalyArtefacts(descriptor.zone);

      let hint: TLabel = `${game.translate_string(descriptor.hint)}\\n \\n`;

      if (anomalyArtefacts.length() === 0) {
        hint += game.translate_string("st_jup_b32_no_af");
      } else {
        hint += game.translate_string("st_jup_b32_has_af");

        for (const [, artefact] of anomalyArtefacts) {
          hint += `\\n${game.translate_string(`st_${artefact}_name`)}`;
        }
      }

      level.map_change_spot_hint(objectId, mapMarks.primary_object, hint);
    }
  }
}
