import type { Nillable, TCount, TDistance, TDuration, TName, TRate } from "xray16/lib";

import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/database/database_types";
import type { TInfoPortion } from "@/engine/lib/constants/info_portions";

/**
 * State of the minigun scheme.
 */
export interface ISchemeMinigunState extends IBaseSchemeState {
  pathFire: Nillable<TName>;
  autoFire: boolean;
  fireTime: TDuration;
  fireRep: TCount;
  fireRange: TDistance;
  fireTarget: string;
  fireTrackTarget: boolean;
  fireAngle: TRate;
  shootOnlyOnVisible: boolean;
  onDeathInfo: Nillable<TInfoPortion>;
  onTargetVis: Nillable<IBaseSchemeLogic>;
  onTargetNvis: Nillable<IBaseSchemeLogic>;
}

/**
 * Enumeration of minigun cannon movement states.
 */
export const enum EMinigunCannonState {
  NONE = 0,
  ROTATE = 1,
  FOLLOW = 2,
  DELAY = 3,
  STOP = 4,
}

/**
 * Enumeration of minigun shooting states.
 */
export const enum EMinigunState {
  SHOOTING_ON = 1,
  NONE = 0,
}

/**
 * Enumeration of minigun fire target states.
 */
export const enum EMinigunFireTargetState {
  NONE = 0,
  POINTS = 1,
  ENEMY = 2,
}
