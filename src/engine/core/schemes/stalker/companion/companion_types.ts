import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/lib/types";

/**
 * State of the companion scheme.
 */
export interface ISchemeCompanionState extends IBaseSchemeState {
  behavior: number;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.COMPANION]: ISchemeCompanionState;
  }
}
