import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { Optional, TName, TRate, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export enum EMobJumpState {
  START_LOOK = 1,
  WAIT_LOOK_END = 2,
  JUMP = 3,
}

/**
 * todo;
 */
export interface ISchemeMobJumpState extends IBaseSchemeState {
  jumpPathName: Optional<TName>;
  phJumpFactor: TRate;
  offset: Vector;
}
