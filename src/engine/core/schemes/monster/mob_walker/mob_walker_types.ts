import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import type { EMonsterState } from "@/engine/lib/constants/monsters";
import type { LuaArray, Optional, TName } from "@/engine/lib/types";

/**
 * State of mob walker scheme state.
 */
export interface ISchemeMobWalkerState extends IBaseSchemeState {
  pathWalk: TName;
  pathLook: Optional<TName>;
  state: Optional<EMonsterState>;
  noReset: boolean;
  pathWalkInfo: Optional<LuaArray<IWaypointData>>;
  pathLookInfo: Optional<LuaArray<IWaypointData>>;
}

/**
 * Mob walker object state.
 */
export enum EMobWalkerState {
  MOVING = 0,
  STANDING = 1,
}
