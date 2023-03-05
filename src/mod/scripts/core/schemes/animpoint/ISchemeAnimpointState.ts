import { LuaArray, Optional, TDistance, TName } from "@/mod/lib/types";
import type { AnimpointManager } from "@/mod/scripts/core/schemes/animpoint/AnimpointManager";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeAnimpointState extends IBaseSchemeState {
  animpoint: AnimpointManager;
  cover_name: TName;
  logic: any;
  use_camp: boolean;
  reach_distance: TDistance;
  reach_movement: TName;
  avail_animations: Optional<LuaArray<TName>>;
  base_action: Optional<TName>;
  description: Optional<TName>;
  approved_actions: LuaTable<number, { name: TName; predicate: () => boolean }>;
  signals: LuaTable;
}
