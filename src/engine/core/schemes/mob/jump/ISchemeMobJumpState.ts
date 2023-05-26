import type { vector } from "xray16";

import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { Optional, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeMobJumpState extends IBaseSchemeState {
  jump_path_name: Optional<string>;
  ph_jump_factor: TRate;
  offset: vector;
}
