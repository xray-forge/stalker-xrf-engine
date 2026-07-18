import { Nillable, TCount, TDistance, TName, TRate } from "xray16/lib";

import { IBaseSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

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
export const enum EHelicopterCombatType {
  FLY_BY = 0,
  ROUND = 1,
  SEARCH = 2,
  RETREAT = 3,
}

/**
 * Enumeration of helicopter fly-by combat sub-states.
 */
export const enum EHelicopterFlyByState {
  TO_ATTACK_DIST = 0,
  TO_ENEMY = 1,
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.HELI_MOVE]: ISchemeHelicopterMoveState;
  }
}
