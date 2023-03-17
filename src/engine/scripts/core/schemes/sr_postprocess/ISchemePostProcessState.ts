import { TRate } from "@/engine/lib/types";
import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemePostProcessState extends IBaseSchemeState {
  intensity: TRate;
  intensity_speed: TRate;
  hit_intensity: TRate;
}
