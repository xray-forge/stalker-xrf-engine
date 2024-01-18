import { IBaseSchemeState } from "@/engine/core/database";
import { Optional, TCount, TDistance, TName, TRate } from "@/engine/lib/types";

/**
 * State of helicopter movement schema.
 */
export interface ISchemeHelicopterMoveState extends IBaseSchemeState {
  pathMove: TName;
  pathLook: Optional<TName>;
  enemyPreference: string; // All, actor, nil.
  firePoint: Optional<string>;
  maxVelocity: TRate;
  maxMinigunDistance: Optional<TDistance>;
  maxRocketDistance: Optional<TDistance>;
  minMinigunDistance: Optional<TDistance>;
  minRocketDistance: Optional<TDistance>;
  updVis: TCount;
  isRocketEnabled: boolean;
  isMinigunEnabled: boolean;
  isEngineSoundEnabled: boolean;
  stopFire: boolean;
  showHealth: boolean;
  fireTrail: boolean;
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
