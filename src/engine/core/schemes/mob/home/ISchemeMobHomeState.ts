import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { EMonsterState } from "@/engine/lib/constants/monsters";
import type { Optional, TDistance } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeMobHomeState extends IBaseSchemeState {
  state: Optional<EMonsterState>;
  home: Optional<string>;
  gulag_point: boolean;
  home_min_radius: TDistance;
  home_mid_radius: TDistance;
  home_max_radius: TDistance;
  aggressive: boolean;
}
