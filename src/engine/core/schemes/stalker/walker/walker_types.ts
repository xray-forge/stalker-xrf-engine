import type { EStalkerState, IPatrolSuggestedState } from "@/engine/core/animation/types";
import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IAnimpointActionDescriptor } from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import type { IWaypointData } from "@/engine/core/utils/ini";
import type { LuaArray, Nillable, TName } from "@/engine/lib/types";

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
