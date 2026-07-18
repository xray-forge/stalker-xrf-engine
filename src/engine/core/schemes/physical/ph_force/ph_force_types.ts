import type { Vector } from "xray16/alias";
import type { TDuration, TIndex, TName, TRate } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/lib/types";

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

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.PH_FORCE]: ISchemePhysicalForceState;
  }
}
