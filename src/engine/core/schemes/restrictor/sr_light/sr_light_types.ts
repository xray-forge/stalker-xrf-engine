import type { IBaseSchemeState } from "@/engine/core/database/database_types";

/**
 * State of scheme handling light / torch states.
 */
export interface ISchemeLightState extends IBaseSchemeState {
  light: boolean;
}
