import { LuaArray, Optional } from "@/engine/lib/types";
import { IAnimpointDescriptor } from "@/engine/scripts/core/schemes/animpoint/animpoint_predicates";
import { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";
import { IWaypointData } from "@/engine/scripts/utils/parse";

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
