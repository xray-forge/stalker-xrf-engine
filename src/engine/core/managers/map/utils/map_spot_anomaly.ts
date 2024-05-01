import { game, level } from "xray16";

import { getObjectIdByStoryId } from "@/engine/core/database";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { getAnomalyArtefacts } from "@/engine/core/utils/anomaly";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { levels } from "@/engine/lib/constants/levels";
import { mapMarks } from "@/engine/lib/constants/map_marks";
import { LuaArray, Optional, TLabel, TNumberId, TSection } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export function updateAnomalyZonesDisplay(): void {
  if (hasInfoPortion(infoPortions.jup_b32_scanner_reward)) {
    for (const [, descriptor] of mapDisplayConfig.SCANNER_SPOTS) {
      descriptor.isEnabled = hasInfoPortion(descriptor.group);
    }
  }

  /**
   * Update artefacts loot display in zones with artefacts.
   * Works for jupiter only.
   */
  if (level.name() === levels.jupiter) {
    for (const [, descriptor] of mapDisplayConfig.SCANNER_SPOTS) {
      if (descriptor.isEnabled) {
        const objectId: Optional<TNumberId> = getObjectIdByStoryId(descriptor.target);

        let hint: TLabel = game.translate_string(descriptor.hint) + "\\n" + " \\n";
        const artefactTable: LuaArray<TSection> = getAnomalyArtefacts(descriptor.zone);

        if (artefactTable.length() > 0) {
          hint += game.translate_string("st_jup_b32_has_af");

          for (const [, v] of artefactTable!) {
            hint += "\\n" + game.translate_string("st_" + v + "_name");
          }
        } else {
          hint += game.translate_string("st_jup_b32_no_af");
        }

        /**
         * Add artifacts info in hotspots.
         */
        if (objectId && level.map_has_object_spot(objectId, mapMarks.primary_object) !== 0) {
          level.map_remove_object_spot(objectId, mapMarks.primary_object);
          level.map_add_object_spot(objectId, mapMarks.primary_object, hint);
        }
      }
    }
  }
}
