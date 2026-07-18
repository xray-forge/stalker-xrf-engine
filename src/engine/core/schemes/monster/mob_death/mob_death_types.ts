import type { Nillable, TNumberId } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * State of monster death scheme.
 */
export interface ISchemeMobDeathState extends IBaseSchemeState {
  killerId: Nillable<TNumberId>;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.MOB_DEATH]: ISchemeMobDeathState;
  }
}
