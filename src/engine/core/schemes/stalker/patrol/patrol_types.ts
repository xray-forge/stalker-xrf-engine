import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { IPatrolSuggestedState } from "@/engine/core/objects/animation/types";
import type { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import type { LuaArray, Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePatrolState extends IBaseSchemeState {
  pathName: string;
  pathWalk: string;
  pathLook: string;
  formation: EPatrolFormation;
  silent: boolean;
  moveType: string;
  suggestedState: IPatrolSuggestedState;
  team: Optional<string>;
  pathWalkInfo: Optional<LuaArray<IWaypointData>>;
  pathLookInfo: Optional<LuaArray<IWaypointData>>;
  patrolKey: string;
  commander: boolean;
}

/**
 * todo;
 */
export enum EPatrolFormation {
  LINE = "line",
  AROUND = "around",
  BACK = "back",
}
