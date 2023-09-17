import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { TRate } from "@/engine/lib/types";

/**
 * State of post-processing scheme logics.
 */
export interface ISchemePostProcessState extends IBaseSchemeState {
  intensity: TRate;
  intensity_speed: TRate;
  hit_intensity: TRate;
}
