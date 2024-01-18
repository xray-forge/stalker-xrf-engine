import { IBaseSchemeState } from "@/engine/core/database";
import { Optional, TCount, TDistance, TName, TRate } from "@/engine/lib/types";

/**
 * State of helicopter movement schema.
 */
export interface ISchemeHelicopterMoveState extends IBaseSchemeState {
  path_move: TName;
  path_look: Optional<TName>;
  enemy_: string;
  fire_point: Optional<string>;
  max_velocity: TRate;
  max_mgun_dist: Optional<TDistance>;
  max_rocket_dist: Optional<TDistance>;
  min_mgun_dist: Optional<TDistance>;
  min_rocket_dist: Optional<TDistance>;
  upd_vis: TCount;
  use_rocket: boolean;
  use_mgun: boolean;
  engine_sound: boolean;
  stop_fire: boolean;
  show_health: boolean;
  fire_trail: boolean;
}

/**
 * Type of helicopter behaviour in combat.
 */
export enum EHelicopterCombatType {
  FLY_BY = 0,
  ROUND = 1,
  SEARCH = 2,
  RETREAT = 3,
}

/**
 * todo;
 */
export enum EHelicopterFlyByState {
  TO_ATTACK_DIST = 0,
  TO_ENEMY = 1,
}
