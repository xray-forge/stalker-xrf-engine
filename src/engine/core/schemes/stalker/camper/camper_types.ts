import type { IPatrolSuggestedState } from "@/engine/core/animation/types";
import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type {
  LuaArray,
  Optional,
  TCount,
  TDistance,
  TDuration,
  TIndex,
  TName,
  TRate,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

/**
 * todo;
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
  attackSound: Optional<TName>;
  idle: TDuration;
  postEnemyWait: TDuration;
  enemyDisp: TRate;
  scandelta: TCount;
  timedelta: TCount;
  timeScanDelta: TCount;
  suggestedState: IPatrolSuggestedState;
  scanTable: LuaTable<any, LuaArray<ICampPoint>>;
  curLookPoint: Optional<TIndex>;
  lastLookPoint: Optional<ICampPoint>;
  scanBegin: Optional<TTimestamp>;
  memEnemy: Optional<TTimestamp>;
  waypointFlag: Optional<number>;
}
