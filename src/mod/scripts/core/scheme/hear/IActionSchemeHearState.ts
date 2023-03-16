import type { Optional, TDistance, TName, TRate } from "@/mod/lib/types";
import type { TConditionList } from "@/mod/scripts/utils/parse";

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
