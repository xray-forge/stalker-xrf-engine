import type { XR_vector } from "xray16";

import type { TDuration, TName, TRate } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemePhysicalForceState extends IBaseSchemeState {
  force: TRate;
  time: TDuration;
  delay: TDuration;
  path_name: TName;
  index: number;
  point: XR_vector;
}
