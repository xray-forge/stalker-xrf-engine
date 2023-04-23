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
  actionNameBase: Optional<TName>;
  cover_name: TName;
  use_camp: boolean;
  reach_distance: TDistance;
  reach_movement: EStalkerState;
  description: Optional<EStalkerState>;
  availableAnimations: Optional<LuaArray<EStalkerState>>;
  approvedActions: LuaArray<IAnimpointAction>;
}
