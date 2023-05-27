import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { Optional, TName, TRate, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeMobJumpState extends IBaseSchemeState {
  jump_path_name: Optional<TName>;
  ph_jump_factor: TRate;
  offset: Vector;
}
