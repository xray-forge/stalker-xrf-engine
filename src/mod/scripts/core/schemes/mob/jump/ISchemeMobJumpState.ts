import type { XR_vector } from "xray16";

import type { TRate } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeMobJumpState extends IBaseSchemeState {
  jump_path_name: string;
  ph_jump_factor: TRate;
  offset: XR_vector;
}
