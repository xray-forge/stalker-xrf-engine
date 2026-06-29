import type { IBaseSchemeState } from "@/engine/core/database/database_types";

/**
 * State of the companion scheme.
 */
export interface ISchemeCompanionState extends IBaseSchemeState {
  behavior: number;
}
