import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { TDuration, TIndex, TName, TRate, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePhysicalForceState extends IBaseSchemeState {
  force: TRate;
  time: TDuration;
  delay: TDuration;
  pathName: TName;
  index: TIndex;
  point: Vector;
}
