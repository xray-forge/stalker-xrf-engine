import { IBaseSchemeState } from "@/engine/core/database/database_types";
import { ESmartCoverState, EStalkerState } from "@/engine/core/objects/animation/types/state_types";
import { Optional, StringOptional, TDuration, TName, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export const COVER_SUBSTATE_TABLE: Record<ESmartCoverState, EStalkerState> = {
  [ESmartCoverState.FIRE_TARGET]: EStalkerState.FIRE,
  [ESmartCoverState.FIRE_NO_LOOKOUT_TARGET]: EStalkerState.FIRE,
  [ESmartCoverState.IDLE_TARGET]: EStalkerState.IDLE,
  [ESmartCoverState.LOOKOUT_TARGET]: EStalkerState.IDLE,
};

/**
 * Smart cover scheme state.
 */
export interface ISchemeSmartCoverState extends IBaseSchemeState {
  coverName: Optional<TName>;
  loopholeName: Optional<TName>;
  coverState: string;
  targetEnemy: Optional<string>;
  targetPath: StringOptional;
  idleMinTime: TDuration;
  idleMaxTime: TDuration;
  lookoutMinTime: TDuration;
  lookoutMaxTime: TDuration;
  exitBodyState: string;
  usePrecalcCover: boolean;
  useInCombat: boolean;
  weaponType: string;
  moving: string;
  soundIdle: string;
  targetPosition: Optional<Vector>; // todo: Probably unused and not needed, commented logic originally.
}
