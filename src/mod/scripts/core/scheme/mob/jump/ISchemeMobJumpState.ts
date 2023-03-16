import type { XR_vector } from "xray16";

import type { Optional, TRate } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";

/**
 * todo;
 */
export interface ISchemeMobJumpState extends IBaseSchemeState {
  jump_path_name: Optional<string>;
  ph_jump_factor: TRate;
  offset: XR_vector;
}
