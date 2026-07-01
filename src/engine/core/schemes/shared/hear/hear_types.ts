import type { TConditionList } from "@/engine/core/utils/ini";
import type { Nillable, TDistance, TName, TRate } from "@/engine/lib/types";

/**
 * State of the hear scheme.
 */
export interface IActionSchemeHearState {
  [index: TName]: {
    [type: string]: Nillable<{
      dist: TDistance;
      power: TRate;
      condlist: TConditionList;
    }>;
  };
}
