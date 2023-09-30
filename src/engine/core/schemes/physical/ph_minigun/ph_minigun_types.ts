import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/database/types";
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
