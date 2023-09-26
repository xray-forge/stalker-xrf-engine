import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { EStalkerState, IPatrolSuggestedState } from "@/engine/core/objects/animation/types";
import type { IAnimpointActionDescriptor } from "@/engine/core/schemes/stalker/animpoint/types";
import type { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import type { LuaArray, Optional, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeWalkerState extends IBaseSchemeState {
  useCamp: boolean;
  pathWalk: TName;
  pathLook: TName;
  team: TName;
  soundIdle: TName;
  suggested_state: IPatrolSuggestedState;
  pathWalkInfo: Optional<LuaArray<IWaypointData>>;
  pathLookInfo: Optional<LuaArray<IWaypointData>>;
  description: Optional<EStalkerState>;
  approvedActions: LuaArray<IAnimpointActionDescriptor>;
}
