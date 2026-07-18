import type { LuaArray, Nillable, TName } from "xray16/lib";

import type { EStalkerState, IPatrolSuggestedState } from "@/engine/core/animation/types";
import type { IAnimpointActionDescriptor } from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { IWaypointData } from "@/engine/core/utils/ini";
import type { EScheme } from "@/engine/lib/types";

/**
 * Walker scheme state.
 */
export interface ISchemeWalkerState extends IBaseSchemeState {
  useCamp: boolean;
  pathWalk: TName;
  pathLook: TName;
  team: TName;
  soundIdle: Nillable<TName>;
  suggestedState: IPatrolSuggestedState;
  pathWalkInfo: Nillable<LuaArray<IWaypointData>>;
  pathLookInfo: Nillable<LuaArray<IWaypointData>>;
  description: Nillable<EStalkerState>;
  approvedActions: LuaArray<IAnimpointActionDescriptor>;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.WALKER]: ISchemeWalkerState;
  }
}
