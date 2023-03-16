import { LuaArray, Optional } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";
import { IWaypointData } from "@/mod/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemeMobWalkerState extends IBaseSchemeState {
  path_walk: string;
  path_look: Optional<string>;
  state: Optional<string>;
  no_reset: boolean;
  path_walk_info: Optional<LuaArray<IWaypointData>>;
  path_look_info: Optional<LuaArray<IWaypointData>>;
}
