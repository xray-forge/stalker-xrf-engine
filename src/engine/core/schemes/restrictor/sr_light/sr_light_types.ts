import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/lib/types";

/**
 * State of scheme handling light / torch states.
 */
export interface ISchemeLightState extends IBaseSchemeState {
  light: boolean;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.SR_LIGHT]: ISchemeLightState;
  }
}
