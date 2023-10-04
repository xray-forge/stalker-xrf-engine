import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { Optional, TName, TRate, Vector } from "@/engine/lib/types";

/**
 * Stage of jump action.
 */
export enum EMobJumpState {
  START_LOOK = 1,
  WAIT_LOOK_END = 2,
  JUMP = 3,
}

/**
 * State of logics scheme forcing monsters to do `scary` jumps.
 */
export interface ISchemeMobJumpState extends IBaseSchemeState {
  jumpPathName: Optional<TName>;
  phJumpFactor: TRate;
  offset: Vector;
}
