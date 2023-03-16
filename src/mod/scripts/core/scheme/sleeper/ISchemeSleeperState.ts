import { LuaArray, Optional } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";
import { IWaypointData } from "@/mod/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemeSleeperState extends IBaseSchemeState {
  path_main: string;
  wakeable: boolean;
  path_walk: Optional<string>;
  path_walk_info: Optional<LuaArray<IWaypointData>>;
  path_look: Optional<string>;
  path_look_info: Optional<LuaArray<IWaypointData>>;
}
