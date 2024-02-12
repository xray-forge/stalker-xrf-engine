import type { TConditionList } from "@/engine/core/utils/ini";
import type { Optional, TDistance, TName, TRate } from "@/engine/lib/types";

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
