import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { LuaArray, TDuration, TName, TProbability } from "@/engine/lib/types";

/**
 * Teleport state.
 * Allows handling active/inactive state for restrictor.
 */
export enum ETeleportState {
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
