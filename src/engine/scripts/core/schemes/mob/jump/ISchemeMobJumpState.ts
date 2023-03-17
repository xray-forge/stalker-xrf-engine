import type { XR_vector } from "xray16";

import type { Optional, TRate } from "@/engine/lib/types";
import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeMobJumpState extends IBaseSchemeState {
  jump_path_name: Optional<string>;
  ph_jump_factor: TRate;
  offset: XR_vector;
}
