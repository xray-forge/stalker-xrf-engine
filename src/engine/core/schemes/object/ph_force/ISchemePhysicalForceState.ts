import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { TDuration, TName, TRate, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePhysicalForceState extends IBaseSchemeState {
  force: TRate;
  time: TDuration;
  delay: TDuration;
  path_name: TName;
  index: number;
  point: Vector;
}
