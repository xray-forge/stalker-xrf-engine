import { GameObject } from "xray16/alias";
import { LuaArray, Nillable, TDistance, TName } from "xray16/lib";

import { EStalkerState } from "@/engine/core/animation/types";
import { AnimpointManager } from "@/engine/core/schemes/stalker/animpoint/AnimpointManager";
import { IBaseSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/lib/types";

/**
 * State of animpoint scheme.
 */
export interface ISchemeAnimpointState extends IBaseSchemeState {
  animpointManager: AnimpointManager;
  actionNameBase: Nillable<TName>;
  coverName: TName;
  useCamp: boolean;
  reachDistanceSqr: TDistance; // Already squared.
  reachMovement: EStalkerState;
  description: Nillable<EStalkerState>;
  availableAnimations: Nillable<LuaArray<EStalkerState>>;
  approvedActions: LuaArray<IAnimpointActionDescriptor>;
}

/**
 * Descriptor of animpoint when object is captured in smart cover and deciding which specific animation to run.
 */
export interface IAnimpointActionDescriptor {
  name: EStalkerState;
  predicate: (this: void, object: GameObject, isInCamp?: boolean) => boolean;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.ANIMPOINT]: ISchemeAnimpointState;
  }
}
