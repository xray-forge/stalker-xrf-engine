import type { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import type { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import type { LuaArray, Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePatrolState extends IBaseSchemeState {
  path_name: string;
  path_walk: string;
  path_look: string;
  formation: string;
  silent: boolean;
  move_type: string;
  suggested_state: {
    standing: string;
    moving: string;
  };
  team: Optional<string>;
  path_walk_info: Optional<LuaArray<IWaypointData>>;
  path_look_info: Optional<LuaArray<IWaypointData>>;
  patrol_key: string;
  commander: boolean;
}
