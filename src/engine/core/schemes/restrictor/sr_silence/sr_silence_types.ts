import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EScheme } from "@/engine/lib/types";

/**
 * State representing silence management scheme.
 */
export interface ISchemeSilenceState extends IBaseSchemeState {}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.SR_SILENCE]: ISchemeSilenceState;
  }
}
