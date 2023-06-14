import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { IWaypointData } from "@/engine/core/utils/ini/parse";
import { EMonsterState } from "@/engine/lib/constants/monsters";
import { LuaArray, Optional } from "@/engine/lib/types";

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
