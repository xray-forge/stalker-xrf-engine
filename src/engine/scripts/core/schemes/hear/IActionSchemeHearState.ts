import type { Optional, TDistance, TName, TRate } from "@/engine/lib/types";
import type { TConditionList } from "@/engine/scripts/utils/parse";

/**
 * todo;
 */
export interface IActionSchemeHearState {
  [index: TName]: {
    [type: string]: Optional<{
      dist: TDistance;
      power: TRate;
      condlist: TConditionList;
    }>;
  };
}
