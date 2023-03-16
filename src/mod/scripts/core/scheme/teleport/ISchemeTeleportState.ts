import type { LuaArray, TDuration, TName, TProbability } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";

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
