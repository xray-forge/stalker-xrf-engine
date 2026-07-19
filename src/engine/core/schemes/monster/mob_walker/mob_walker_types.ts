import type { LuaArray, Nillable, TName } from "xray16/lib";

import type { EMonsterState } from "@/engine/constants/monsters";
import type { IWaypointData } from "@/engine/core/ini";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

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

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.MOB_WALKER]: ISchemeMobWalkerState;
  }
}
