import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EScheme } from "@/engine/lib/types";

/**
 * State of the idle scheme.
 */
export interface ISchemeIdleState extends IBaseSchemeState {
  //
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.SR_IDLE]: ISchemeIdleState;
  }
}
