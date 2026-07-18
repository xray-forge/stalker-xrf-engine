import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * State of the idle scheme.
 */
export interface ISchemeIdleState extends IBaseSchemeState {
  //
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.SR_IDLE]: ISchemeIdleState;
  }
}
