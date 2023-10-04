import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { TRate } from "@/engine/lib/types";

/**
 * State of post-processing scheme logics.
 */
export interface ISchemePostProcessState extends IBaseSchemeState {
  intensity: TRate;
  intensitySpeed: TRate;
  hitIntensity: TRate;
}
