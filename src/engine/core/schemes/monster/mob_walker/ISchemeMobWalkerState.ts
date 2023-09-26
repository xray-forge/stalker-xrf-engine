import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import type { EMonsterState } from "@/engine/lib/constants/monsters";
import type { LuaArray, Optional, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeMobWalkerState extends IBaseSchemeState {
  pathWalk: TName;
  pathLook: Optional<TName>;
  state: Optional<EMonsterState>;
  noReset: boolean;
  pathWalkInfo: Optional<LuaArray<IWaypointData>>;
  pathLookInfo: Optional<LuaArray<IWaypointData>>;
}
