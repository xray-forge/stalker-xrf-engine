import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EScheme } from "@/engine/lib/types";

/**
 * State of scheme implementing reach task logics.
 */
export interface ISchemeReachTaskState extends IBaseSchemeState {
  //
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.REACH_TASK]: ISchemeReachTaskState;
  }
}
