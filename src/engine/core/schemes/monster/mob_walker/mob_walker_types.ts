import type { LuaArray, Nillable, TName } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IWaypointData } from "@/engine/core/utils/ini";
import type { EMonsterState } from "@/engine/lib/constants/monsters";

/**
 * State of mob walker scheme state.
 */
export interface ISchemeMobWalkerState extends IBaseSchemeState {
  pathWalk: TName;
  pathLook: Nillable<TName>;
  state: Nillable<EMonsterState>;
  noReset: boolean;
  pathWalkInfo: Nillable<LuaArray<IWaypointData>>;
  pathLookInfo: Nillable<LuaArray<IWaypointData>>;
}

/**
 * Mob walker object state.
 */
export const enum EMobWalkerState {
  MOVING = 0,
  STANDING = 1,
}
