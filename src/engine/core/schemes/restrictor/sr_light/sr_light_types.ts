import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EScheme } from "@/engine/lib/types";

/**
 * State of scheme handling light / torch states.
 */
export interface ISchemeLightState extends IBaseSchemeState {
  light: boolean;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.SR_LIGHT]: ISchemeLightState;
  }
}
