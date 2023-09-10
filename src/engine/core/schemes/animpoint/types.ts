import { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import { EStalkerState } from "@/engine/core/objects/animation";
import { AnimpointManager } from "@/engine/core/schemes/animpoint/AnimpointManager";
import { ClientObject, LuaArray, Optional, TDistance, TName } from "@/engine/lib/types";

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
  predicate: (this: void, object: ClientObject, isInCamp?: boolean) => boolean;
}
