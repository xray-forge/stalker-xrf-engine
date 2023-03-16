import type { Optional, TDistance } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";

/**
 * todo;
 */
export interface ISchemeMobHomeState extends IBaseSchemeState {
  state: Optional<string>;
  home: Optional<string>;
  gulag_point: boolean;
  home_min_radius: TDistance;
  home_mid_radius: TDistance;
  home_max_radius: TDistance;
  aggressive: boolean;
}
