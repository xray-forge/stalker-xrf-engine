import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EScheme } from "@/engine/lib/types";

/**
 * State of the companion scheme.
 */
export interface ISchemeCompanionState extends IBaseSchemeState {
  behavior: number;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.COMPANION]: ISchemeCompanionState;
  }
}
