import type { IBaseSchemeState } from "@/engine/core/schemes/base";
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
