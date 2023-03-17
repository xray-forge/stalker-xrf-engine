import type { Optional, TCount, TNumberId, TRate, TStringId } from "@/engine/lib/types";
import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeDeimosState extends IBaseSchemeState {
  movement_speed: TRate;
  growing_koef: TRate;
  lowering_koef: TRate;
  pp_effector: TStringId;
  pp_effector2: TStringId;
  cam_effector: TStringId;
  cam_effector_repeating_time: TCount;
  noise_sound: string;
  heartbeet_sound: string;
  health_lost: TCount;
  disable_bound: number;
  switch_lower_bound: number;
  switch_upper_bound: number;
  intensity: number;
}
