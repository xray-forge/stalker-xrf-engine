import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import { LuaArray, Optional, TName } from "@/engine/lib/types";

export interface ISchemeSleeperState extends IBaseSchemeState {
  pathMain: TName;
  wakeable: boolean;
  pathWalk: Optional<TName>;
  pathWalkInfo: Optional<LuaArray<IWaypointData>>;
  pathLook: Optional<TName>;
  pathLookInfo: Optional<LuaArray<IWaypointData>>;
}

/**
 * todo;
 */
export enum ESleeperState {
  WALKING = 0,
  SLEEPING = 1,
}
