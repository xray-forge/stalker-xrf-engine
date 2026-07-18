import type { TName, TRate } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EScheme } from "@/engine/lib/types";

/**
 * State describing physical hit scheme.
 */
export interface ISchemePhysicalHitState extends IBaseSchemeState {
  power: TRate;
  impulse: TRate;
  bone: TName;
  dirPath: TName;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.PH_HIT]: ISchemePhysicalHitState;
  }
}
