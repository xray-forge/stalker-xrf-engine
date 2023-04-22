import { EStalkerState } from "@/engine/core/objects/state";
import type { AnimpointManager } from "@/engine/core/schemes/animpoint/AnimpointManager";
import { IAnimpointAction } from "@/engine/core/schemes/animpoint/types";
import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { LuaArray, Optional, TDistance, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeAnimpointState extends IBaseSchemeState {
  animpoint: AnimpointManager;
  cover_name: TName;
  use_camp: boolean;
  reach_distance: TDistance;
  reach_movement: EStalkerState;
  avail_animations: Optional<LuaArray<EStalkerState>>;
  base_action: Optional<TName>;
  description: Optional<EStalkerState>;
  approvedActions: LuaArray<IAnimpointAction>;
}
