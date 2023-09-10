import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import type { EMonsterState } from "@/engine/lib/constants/monsters";
import type { LuaArray, Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeMobWalkerState extends IBaseSchemeState {
  path_walk: string;
  path_look: Optional<string>;
  state: Optional<EMonsterState>;
  no_reset: boolean;
  path_walk_info: Optional<LuaArray<IWaypointData>>;
  path_look_info: Optional<LuaArray<IWaypointData>>;
}
