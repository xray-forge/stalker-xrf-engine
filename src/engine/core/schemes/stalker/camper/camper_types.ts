import type { Vector } from "xray16/alias";
import type { LuaArray, Nillable, TCount, TDistance, TDuration, TIndex, TName, TRate, TTimestamp } from "xray16/lib";

import type { IPatrolSuggestedState } from "@/engine/core/animation/types";
import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { EScheme } from "@/engine/lib/types";

/**
 * Single look point used when scanning, pairing a waypoint key with its world position.
 */
export interface ICampPoint {
  key: number;
  pos: Vector;
}

/**
 * Camper scheme state.
 */
export interface ISchemeCamperState extends IBaseSchemeState {
  pathWalk: TName;
  pathLook: TName;
  shoot: TName;
  sniperAim: string;
  sniperAnim: string;
  radius: TDistance;
  sniper: boolean;
  noRetreat: boolean;
  scantimeFree: TDuration;
  attackSound: Nillable<TName>;
  idle: TDuration;
  postEnemyWait: TDuration;
  enemyDisp: TRate;
  scandelta: TCount;
  timedelta: TCount;
  timeScanDelta: TCount;
  suggestedState: IPatrolSuggestedState;
  scanTable: LuaTable<any, LuaArray<ICampPoint>>;
  curLookPoint: Nillable<TIndex>;
  lastLookPoint: Nillable<ICampPoint>;
  scanBegin: Nillable<TTimestamp>;
  memEnemy: Nillable<TTimestamp>;
  waypointFlag: Nillable<number>;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.CAMPER]: ISchemeCamperState;
  }
}
