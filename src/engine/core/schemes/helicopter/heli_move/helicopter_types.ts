import { IBaseSchemeState } from "@/engine/core/database";
import { Nillable, TCount, TDistance, TName, TRate } from "@/engine/lib/types";

/**
 * State of helicopter movement schema.
 */
export interface ISchemeHelicopterMoveState extends IBaseSchemeState {
  pathMove: TName;
  pathLook: Nillable<TName>;
  enemyPreference: string; // All, actor, nil.
  firePoint: Nillable<string>;
  maxVelocity: TRate;
  maxMinigunDistance: Nillable<TDistance>;
  maxRocketDistance: Nillable<TDistance>;
  minMinigunDistance: Nillable<TDistance>;
  minRocketDistance: Nillable<TDistance>;
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
 * Enumeration of helicopter fly-by combat sub-states.
 */
export enum EHelicopterFlyByState {
  TO_ATTACK_DIST = 0,
  TO_ENEMY = 1,
}
