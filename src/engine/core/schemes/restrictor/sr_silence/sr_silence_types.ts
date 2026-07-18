import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * State representing silence management scheme.
 */
export interface ISchemeSilenceState extends IBaseSchemeState {}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.SR_SILENCE]: ISchemeSilenceState;
  }
}
