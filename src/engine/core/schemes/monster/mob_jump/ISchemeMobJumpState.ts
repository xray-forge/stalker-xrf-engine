import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { Optional, TName, TRate, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeMobJumpState extends IBaseSchemeState {
  jumpPathName: Optional<TName>;
  phJumpFactor: TRate;
  offset: Vector;
}
