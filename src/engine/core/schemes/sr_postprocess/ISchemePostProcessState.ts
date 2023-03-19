import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import { TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePostProcessState extends IBaseSchemeState {
  intensity: TRate;
  intensity_speed: TRate;
  hit_intensity: TRate;
}
