import type { Nillable, TDistance } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EMonsterState } from "@/engine/lib/constants/monsters";
import type { EScheme } from "@/engine/lib/types";

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

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.MOB_HOME]: ISchemeMobHomeState;
  }
}
