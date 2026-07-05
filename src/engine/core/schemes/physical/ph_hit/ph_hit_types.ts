import type { TName, TRate } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";

/**
 * State describing physical hit scheme.
 */
export interface ISchemePhysicalHitState extends IBaseSchemeState {
  power: TRate;
  impulse: TRate;
  bone: TName;
  dirPath: TName;
}
