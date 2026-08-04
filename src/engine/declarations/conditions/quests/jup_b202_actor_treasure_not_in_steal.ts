import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Check if b202 actor treasures are not stolen.
 */
extern("xr_conditions.jup_b202_actor_treasure_not_in_steal", (_: GameObject, __: GameObject): boolean => {
  const before: boolean =
    !hasInfoPortion(infoPortions.jup_b52_actor_items_can_be_stolen) &&
    !hasInfoPortion(infoPortions.jup_b202_actor_items_returned);
  const after: boolean =
    hasInfoPortion(infoPortions.jup_b52_actor_items_can_be_stolen) &&
    hasInfoPortion(infoPortions.jup_b202_actor_items_returned);

  return before || after;
});
