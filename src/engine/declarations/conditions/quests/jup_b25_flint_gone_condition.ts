import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Check if flint was removed from Yanov.
 */
extern("xr_conditions.jup_b25_flint_gone_condition", (): boolean => {
  return (
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_duty) ||
    hasInfoPortion(infoPortions.jup_b25_flint_blame_done_to_freedom) ||
    hasInfoPortion(infoPortions.zat_b106_found_soroka_done)
  );
});
