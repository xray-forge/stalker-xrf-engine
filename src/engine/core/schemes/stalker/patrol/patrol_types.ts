import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EPatrolFormation } from "@/engine/core/objects/ai/patrol";
import type { IPatrolSuggestedState } from "@/engine/core/objects/animation/types";
import type { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import type { LuaArray, Optional, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePatrolState extends IBaseSchemeState {
  pathName: TName;
  pathWalk: TName;
  pathLook: TName;
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
