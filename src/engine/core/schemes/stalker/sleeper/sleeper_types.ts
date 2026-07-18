import type { LuaArray, Nillable, TName } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";
import type { IWaypointData } from "@/engine/core/utils/ini";

export interface ISchemeSleeperState extends IBaseSchemeState {
  pathMain: TName;
  wakeable: boolean;
  pathWalk: Nillable<TName>;
  pathWalkInfo: Nillable<LuaArray<IWaypointData>>;
  pathLook: Nillable<TName>;
  pathLookInfo: Nillable<LuaArray<IWaypointData>>;
}

/**
 * State of stalker with active sleeper scheme.
 */
export const enum ESleeperState {
  WALKING = 0,
  SLEEPING = 1,
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.SLEEPER]: ISchemeSleeperState;
  }
}
