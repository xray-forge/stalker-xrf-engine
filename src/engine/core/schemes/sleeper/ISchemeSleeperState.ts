import { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import { LuaArray, Optional } from "@/engine/lib/types";

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
