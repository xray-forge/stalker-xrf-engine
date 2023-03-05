import { LuaArray, Optional } from "@/mod/lib/types";
import { IAnimpointDescriptor } from "@/mod/scripts/core/schemes/animpoint/animpoint_predicates";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import { IWaypointData } from "@/mod/scripts/utils/parse";

/**
 * todo;
 */
export interface ISchemeWalkerState extends IBaseSchemeState {
  path_walk: string;
  path_look: string;
  team: string;
  sound_idle: string;
  getConfigBoolean: boolean;
  use_camp: boolean;
  suggested_state: {
    standing: string;
    moving: string;
  };

  path_walk_info: Optional<LuaArray<IWaypointData>>;
  path_look_info: Optional<LuaArray<IWaypointData>>;
  description: Optional<string>;

  approved_actions: LuaArray<IAnimpointDescriptor>;
}
