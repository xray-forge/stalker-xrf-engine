import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IWaypointData } from "@/engine/core/utils/ini";
import type { LuaArray, Optional, TName } from "@/engine/lib/types";

export interface ISchemeSleeperState extends IBaseSchemeState {
  pathMain: TName;
  wakeable: boolean;
  pathWalk: Optional<TName>;
  pathWalkInfo: Optional<LuaArray<IWaypointData>>;
  pathLook: Optional<TName>;
  pathLookInfo: Optional<LuaArray<IWaypointData>>;
}

/**
 * State of stalker with active sleeper scheme.
 */
export enum ESleeperState {
  WALKING = 0,
  SLEEPING = 1,
}
