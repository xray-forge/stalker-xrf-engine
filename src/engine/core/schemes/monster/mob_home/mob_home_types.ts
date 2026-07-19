import type { Nillable, TDistance } from "xray16/lib";

import type { EMonsterState } from "@/engine/constants/monsters";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * State of home parameters for mob home scheme.
 */
export interface ISchemeMobHomeState extends IBaseSchemeState {
  monsterState: Nillable<EMonsterState>;
  homeWayPoint: Nillable<string>;
  isSmartTerrainPoint: boolean;
  homeMinRadius: Nillable<TDistance>;
  homeMidRadius: Nillable<TDistance>;
  homeMaxRadius: Nillable<TDistance>;
  isAggressive: boolean;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.MOB_HOME]: ISchemeMobHomeState;
  }
}
