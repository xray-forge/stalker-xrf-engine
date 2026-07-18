import type { TCount, TRate, TStringId } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * State of the deimos scheme.
 */
export interface ISchemeDeimosState extends IBaseSchemeState {
  movementSpeed: TRate;
  growingRate: TRate;
  loweringRate: TRate;
  ppEffector: TStringId;
  ppEffector2: TStringId;
  camEffector: TStringId;
  camEffectorRepeatingTime: TCount;
  noiseSound: string;
  heartbeatSound: string;
  healthLost: TCount;
  disableBound: number;
  switchLowerBound: number;
  switchUpperBound: number;
  intensity: number;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.SR_DEIMOS]: ISchemeDeimosState;
  }
}
