import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { EStalkerState } from "@/engine/core/objects/animation/types";
import { AnimpointManager } from "@/engine/core/schemes/stalker/animpoint/AnimpointManager";
import { GameObject, LuaArray, Optional, TDistance, TName } from "@/engine/lib/types";

/**
 * State of animpoint scheme.
 */
export interface ISchemeAnimpointState extends IBaseSchemeState {
  animpointManager: AnimpointManager;
  actionNameBase: Optional<TName>;
  coverName: TName;
  useCamp: boolean;
  reachDistanceSqr: TDistance; // Already squared.
  reachMovement: EStalkerState;
  description: Optional<EStalkerState>;
  availableAnimations: Optional<LuaArray<EStalkerState>>;
  approvedActions: LuaArray<IAnimpointActionDescriptor>;
}

/**
 * Descriptor of animpoint when object is captured in smart cover and deciding which specific animation to run.
 */
export interface IAnimpointActionDescriptor {
  name: EStalkerState;
  predicate: (this: void, object: GameObject, isInCamp?: boolean) => boolean;
}
