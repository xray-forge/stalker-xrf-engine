import type { Nillable, TDistance, TName, TRate } from "xray16/lib";

import type { TConditionList } from "@/engine/core/ini";

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
