import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { TName, TProbability, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePsyAntennaState extends IBaseSchemeState {
  intensity: TRate;
  postprocess: TName;
  hitIntensity: TRate;
  phantomProb: TProbability;
  muteSoundThreshold: TRate;
  noStatic: boolean;
  noMumble: boolean;
  hitType: string;
  hitFreq: TRate;
}

/**
 * todo;
 */
export enum EAntennaState {
  OUTSIDE = 0,
  INSIDE = 1,
  VOID = 2,
}
