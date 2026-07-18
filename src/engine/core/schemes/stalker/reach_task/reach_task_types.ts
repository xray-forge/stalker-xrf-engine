import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/lib/types";

/**
 * State of scheme implementing reach task logics.
 */
export interface ISchemeReachTaskState extends IBaseSchemeState {
  //
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.REACH_TASK]: ISchemeReachTaskState;
  }
}
