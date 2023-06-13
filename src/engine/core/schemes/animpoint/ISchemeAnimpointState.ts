import type { EStalkerState } from "@/engine/core/objects/state";
import type { AnimpointManager } from "@/engine/core/schemes/animpoint/AnimpointManager";
import type { IAnimpointAction } from "@/engine/core/schemes/animpoint/types";
import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { LuaArray, Optional, TDistance, TName } from "@/engine/lib/types";

/**
 * State of animpoint scheme.
 */
export interface ISchemeAnimpointState extends IBaseSchemeState {
  animpoint: AnimpointManager;
  actionNameBase: Optional<TName>;
  coverName: TName;
  useCamp: boolean;
  reachDistance: TDistance; // Already squared.
  reachMovement: EStalkerState;
  description: Optional<EStalkerState>;
  availableAnimations: Optional<LuaArray<EStalkerState>>;
  approvedActions: LuaArray<IAnimpointAction>;
}
