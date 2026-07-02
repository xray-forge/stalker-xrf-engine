import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IWaypointData } from "@/engine/core/utils/ini";
import type { LuaArray, Nillable, TName } from "@/engine/lib/types";

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
