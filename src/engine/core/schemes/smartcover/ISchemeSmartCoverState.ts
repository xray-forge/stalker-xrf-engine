import { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import { ESmartCoverState } from "@/engine/core/objects/animation/types/state_types";
import { Optional, StringOptional, TDuration, TName, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export const COVER_SUBSTATE_TABLE: Record<ESmartCoverState, string> = {
  [ESmartCoverState.FIRE_TARGET]: "fire",
  [ESmartCoverState.FIRE_NO_LOOKOUT_TARGET]: "fire",
  [ESmartCoverState.IDLE_TARGET]: "idle",
  [ESmartCoverState.LOOKOUT_TARGET]: "idle",
};

/**
 * Smart cover scheme state.
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
  target_position: Optional<Vector>; // todo: Probably unused and not needed, commented logic originally.
}
