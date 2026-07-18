import type { LuaArray, TDuration, TName, TProbability } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/lib/types";

/**
 * Teleport state.
 * Allows handling active/inactive state for restrictor.
 */
export const enum ETeleportState {
  IDLE,
  ACTIVATED,
}

/**
 * Possible teleport point from restrictor.
 */
export interface ITeleportPoint {
  point: TName;
  look: TName;
  probability: TProbability;
}

/**
 * Teleport scheme state.
 */
export interface ISchemeTeleportState extends IBaseSchemeState {
  timeout: TDuration;
  points: LuaArray<ITeleportPoint>;
  maxTotalProbability: TProbability; // Sum of all points probability.
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.SR_TELEPORT]: ISchemeTeleportState;
  }
}
