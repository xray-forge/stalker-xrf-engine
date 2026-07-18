import type { GameObject, Vector } from "xray16/alias";
import type { LuaArray, Nillable, TDistance, TName, TStringId } from "xray16/lib";

import type { EPatrolFormation } from "@/engine/core/ai/patrol";
import type { IPatrolSuggestedState } from "@/engine/core/animation/types";
import type { PatrolManager } from "@/engine/core/schemes/stalker/patrol/PatrolManager";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { IWaypointData } from "@/engine/core/utils/ini";
import type { EScheme } from "@/engine/lib/types";

/**
 * Descriptor of patrol captured object state.
 */
export interface IPatrolObjectDescriptor {
  object: GameObject;
  direction: Vector;
  distance: TDistance;
}

/**
 * Descriptor of object position in formation schema.
 */
export interface IFormationObjectDescriptor {
  distance: TDistance;
  direction: Vector;
}

/**
 * State of scheme implementing patrol.
 */
export interface ISchemePatrolState extends IBaseSchemeState {
  pathName: TName;
  pathWalk: TName;
  pathLook: TName;
  formation: EPatrolFormation;
  silent: boolean;
  moveType: string;
  suggestedState: IPatrolSuggestedState;
  team: Nillable<string>;
  pathWalkInfo: Nillable<LuaArray<IWaypointData>>;
  pathLookInfo: Nillable<LuaArray<IWaypointData>>;
  patrolKey: TStringId;
  patrolManager: PatrolManager;
  commander: boolean;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.PATROL]: ISchemePatrolState;
  }
}
