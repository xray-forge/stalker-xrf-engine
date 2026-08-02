import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Check whether the conditions to spawn Senya in the `jup_b25` quest are met.
 *
 * @returns Whether one of the required progress info portions and the Soroka search info portion are present.
 */
extern("xr_conditions.jup_b25_senya_spawn_condition", (): boolean => {
  return (
    (hasInfoPortion(infoPortions.jup_b16_oasis_found) ||
      hasInfoPortion(infoPortions.zat_b57_bloodsucker_lair_clear) ||
      hasInfoPortion(infoPortions.jup_b6_complete_end) ||
      hasInfoPortion(infoPortions.zat_b215_gave_maps)) &&
    hasInfoPortion(infoPortions.zat_b106_search_soroka)
  );
});
