import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { TDuration, TIndex, TName, TRate, Vector } from "@/engine/lib/types";

/**
 * State of physical force scheme.
 */
export interface ISchemePhysicalForceState extends IBaseSchemeState {
  force: TRate;
  time: TDuration;
  delay: TDuration;
  pathName: TName;
  index: TIndex;
  point: Vector;
}
