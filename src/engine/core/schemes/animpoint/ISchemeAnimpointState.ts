import type { AnimpointManager } from "@/engine/core/schemes/animpoint/AnimpointManager";
import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { LuaArray, Optional, TDistance, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export interface IAnimpointAction {
  name: TName;
  predicate: () => boolean;
}

/**
 * todo;
 */
export interface ISchemeAnimpointState extends IBaseSchemeState {
  animpoint: AnimpointManager;
  cover_name: TName;
  use_camp: boolean;
  reach_distance: TDistance;
  reach_movement: TName;
  avail_animations: Optional<LuaArray<TName>>;
  base_action: Optional<TName>;
  description: Optional<TName>;
  approved_actions: LuaArray<IAnimpointAction>;
}
