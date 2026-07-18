import type { Nillable, TNumberId } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EScheme } from "@/engine/lib/types";

/**
 * State of monster death scheme.
 */
export interface ISchemeMobDeathState extends IBaseSchemeState {
  killerId: Nillable<TNumberId>;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.MOB_DEATH]: ISchemeMobDeathState;
  }
}
