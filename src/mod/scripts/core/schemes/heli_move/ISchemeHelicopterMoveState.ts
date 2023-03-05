import type { TCount, TDistance, TRate } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeHelicopterMoveState extends IBaseSchemeState {
  path_move: string;
  path_look: string;
  enemy_: string;
  fire_point: string;
  max_velocity: TRate;
  max_mgun_dist: TDistance;
  max_rocket_dist: TDistance;
  min_mgun_dist: TDistance;
  min_rocket_dist: TDistance;
  upd_vis: TCount;
  use_rocket: boolean;
  use_mgun: boolean;
  engine_sound: boolean;
  stop_fire: boolean;
  show_health: boolean;
  fire_trail: boolean;
}
