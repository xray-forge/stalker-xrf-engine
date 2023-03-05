import { TRate } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemePostProcessState extends IBaseSchemeState {
  intensity: TRate;
  intensity_speed: TRate;
  hit_intensity: TRate;
}
