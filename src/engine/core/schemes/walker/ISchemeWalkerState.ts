import type { EStalkerState } from "@/engine/core/objects/state";
import type { IAnimpointAction } from "@/engine/core/schemes/animpoint/types";
import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { IWaypointData } from "@/engine/core/utils/ini/types";
import type { LuaArray, Optional, TName } from "@/engine/lib/types";

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
  description: Optional<EStalkerState>;

  approvedActions: LuaArray<IAnimpointAction>;
}
