import { XR_vector } from "xray16";

import { Optional, StringOptional, TDuration, TName } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";

/**
 * todo;
 */
export enum ECoverState {
  FIRE_TARGET = "fire_target",
  FIRE_NO_LOOKOUT_TARGET = "fire_no_lookout_target",
  IDLE_TARGET = "idle_target",
  LOOKOUT_TARGET = "lookout_target",
}

/**
 * todo;
 */
export const cover_substate_table: Record<ECoverState, string> = {
  [ECoverState.FIRE_TARGET]: "fire",
  [ECoverState.FIRE_NO_LOOKOUT_TARGET]: "fire",
  [ECoverState.IDLE_TARGET]: "idle",
  [ECoverState.LOOKOUT_TARGET]: "idle",
};

/**
 * todo;
 */
export interface ISchemeSmartCoverState extends IBaseSchemeState {
  cover_name: Optional<TName>;
  loophole_name: Optional<TName>;
  cover_state: string;
  target_enemy: Optional<string>;
  target_path: StringOptional;
  idle_min_time: TDuration;
  idle_max_time: TDuration;
  lookout_min_time: TDuration;
  lookout_max_time: TDuration;
  exit_body_state: string;
  use_precalc_cover: boolean;
  use_in_combat: boolean;
  weapon_type: string;
  moving: string;
  sound_idle: string;
  target_position: Optional<XR_vector>; // todo: Probably unused and not needed, commented logic originally.
}
