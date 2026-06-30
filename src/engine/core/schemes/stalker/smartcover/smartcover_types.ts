import { ESmartCoverState, EStalkerState } from "@/engine/core/animation/types/state_types";
import { IBaseSchemeState } from "@/engine/core/database/database_types";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, StringNillable, TDuration, TName, TStringId, Vector } from "@/engine/lib/types";

/**
 * Mapping of smart cover substates to the stalker animation state used for each of them.
 */
export const COVER_SUBSTATE_TABLE: Record<ESmartCoverState, EStalkerState> = {
  [ESmartCoverState.DEFAULT]: NIL as EStalkerState,
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
  targetEnemy: Optional<TStringId>; // Story ID of target enemy.
  targetPath: StringNillable;
  idleMinTime: TDuration;
  idleMaxTime: TDuration;
  lookoutMinTime: TDuration;
  lookoutMaxTime: TDuration;
  exitBodyState: string;
  usePrecalcCover: boolean;
  useInCombat: boolean;
  weaponType: string;
  moving: string;
  soundIdle: Optional<string>;
  targetPosition: Optional<Vector>; // todo: Probably unused and not needed, commented logic originally.
}
