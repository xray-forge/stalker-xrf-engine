import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { IWaypointData } from "@/engine/core/utils/parse";
import { LuaArray, Optional } from "@/engine/lib/types";

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
