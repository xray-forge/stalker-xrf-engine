import type { vector } from "xray16";

import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { TDuration, TName, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePhysicalForceState extends IBaseSchemeState {
  force: TRate;
  time: TDuration;
  delay: TDuration;
  path_name: TName;
  index: number;
  point: vector;
}
