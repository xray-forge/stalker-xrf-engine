import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { LuaArray, TDuration, TName, TProbability } from "@/engine/lib/types";

/**
 * todo;
 */
export enum ETeleportState {
  IDLE,
  ACTIVATED,
}

/**
 * todo;
 */
export interface ITeleportPoint {
  point: TName;
  look: TName;
  prob: TProbability;
}

/**
 * todo;
 */
export interface ISchemeTeleportState extends IBaseSchemeState {
  timeout: TDuration;
  points: LuaArray<ITeleportPoint>;
}
