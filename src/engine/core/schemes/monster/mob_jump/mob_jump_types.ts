import type { Vector } from "xray16/alias";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { Nillable, TName, TRate } from "@/engine/lib/types";

/**
 * Stage of jump action.
 */
export const enum EMobJumpState {
  START_LOOK = 1,
  WAIT_LOOK_END = 2,
  JUMP = 3,
}

/**
 * State of logics scheme forcing monsters to do `scary` jumps.
 */
export interface ISchemeMobJumpState extends IBaseSchemeState {
  jumpPathName: Nillable<TName>;
  phJumpFactor: TRate;
  offset: Vector;
}
