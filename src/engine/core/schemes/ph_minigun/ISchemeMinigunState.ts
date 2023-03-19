import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/schemes/base";
import type { TInfoPortion } from "@/engine/lib/constants/info_portions";
import type { Optional, TCount, TDistance, TDuration, TName, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeMinigunState extends IBaseSchemeState {
  path_fire: Optional<TName>;
  auto_fire: boolean;
  fire_time: TDuration;
  fire_rep: TCount;
  fire_range: TDistance;
  fire_target: string;
  fire_track_target: boolean;
  fire_angle: TRate;
  shoot_only_on_visible: boolean;
  on_death_info: Optional<TInfoPortion>;
  on_target_vis: Optional<IBaseSchemeLogic>;
  on_target_nvis: Optional<IBaseSchemeLogic>;
}
