import type { EStalkerState, IPatrolSuggestedState } from "@/engine/core/animation/types";
import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IAnimpointActionDescriptor } from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import type { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import type { LuaArray, Optional, TName } from "@/engine/lib/types";

/**
 * Walker scheme state.
 */
export interface ISchemeWalkerState extends IBaseSchemeState {
  useCamp: boolean;
  pathWalk: TName;
  pathLook: TName;
  team: TName;
  soundIdle: Optional<TName>;
  suggestedState: IPatrolSuggestedState;
  pathWalkInfo: Optional<LuaArray<IWaypointData>>;
  pathLookInfo: Optional<LuaArray<IWaypointData>>;
  description: Optional<EStalkerState>;
  approvedActions: LuaArray<IAnimpointActionDescriptor>;
}
