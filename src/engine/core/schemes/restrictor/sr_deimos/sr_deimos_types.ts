import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { TCount, TRate, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeDeimosState extends IBaseSchemeState {
  movementSpeed: TRate;
  growingRate: TRate;
  loweringRate: TRate;
  ppEffector: TStringId;
  ppEffector2: TStringId;
  camEffector: TStringId;
  camEffectorRepeatingTime: TCount;
  noiseSound: string;
  heartbeatSound: string;
  healthLost: TCount;
  disableBound: number;
  switchLowerBound: number;
  switchUpperBound: number;
  intensity: number;
}
