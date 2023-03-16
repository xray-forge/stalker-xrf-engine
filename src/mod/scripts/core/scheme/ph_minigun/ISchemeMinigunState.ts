import type { TInfoPortion } from "@/mod/globals/info_portions";
import type { Optional, TCount, TDistance, TDuration, TName, TRate } from "@/mod/lib/types";
import type { IBaseSchemeLogic, IBaseSchemeState } from "@/mod/scripts/core/scheme/base";
import type { TConditionList } from "@/mod/scripts/utils/parse";

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
