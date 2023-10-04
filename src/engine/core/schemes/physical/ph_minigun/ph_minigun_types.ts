import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/database/database_types";
import type { TInfoPortion } from "@/engine/lib/constants/info_portions";
import type { Optional, TCount, TDistance, TDuration, TName, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeMinigunState extends IBaseSchemeState {
  pathFire: Optional<TName>;
  autoFire: boolean;
  fireTime: TDuration;
  fireRep: TCount;
  fireRange: TDistance;
  fireTarget: string;
  fireTrackTarget: boolean;
  fireAngle: TRate;
  shootOnlyOnVisible: boolean;
  onDeathInfo: Optional<TInfoPortion>;
  onTargetVis: Optional<IBaseSchemeLogic>;
  onTargetNvis: Optional<IBaseSchemeLogic>;
}

/**
 * todo;
 */
export enum EMinigunCannonState {
  NONE = 0,
  ROTATE = 1,
  FOLLOW = 2,
  DELAY = 3,
  STOP = 4,
}

/**
 * todo;
 */
export enum EMinigunState {
  SHOOTING_ON = 1,
  NONE = 0,
}

/**
 * todo;
 */
export enum EMinigunFireTargetState {
  NONE = 0,
  POINTS = 1,
  ENEMY = 2,
}
