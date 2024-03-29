import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EMonsterState } from "@/engine/lib/constants/monsters";
import type { Optional, TDistance } from "@/engine/lib/types";

/**
 * State of home parameters for mob home scheme.
 */
export interface ISchemeMobHomeState extends IBaseSchemeState {
  monsterState: Optional<EMonsterState>;
  homeWayPoint: Optional<string>;
  isSmartTerrainPoint: boolean;
  homeMinRadius: Optional<TDistance>;
  homeMidRadius: Optional<TDistance>;
  homeMaxRadius: Optional<TDistance>;
  isAggressive: boolean;
}
