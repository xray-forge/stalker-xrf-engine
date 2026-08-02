import { extern } from "xray16/lib";

import { hasAchievedInformationDealer } from "@/engine/core/utils/achievements";

/**
 * Check whether `information dealer` is achieved.
 */
extern("xr_conditions.information_dealer_functor", (): boolean => {
  return hasAchievedInformationDealer();
});
