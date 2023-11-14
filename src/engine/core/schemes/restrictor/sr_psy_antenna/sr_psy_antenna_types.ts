import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { TName, TProbability, TRate } from "@/engine/lib/types";

/**
 * State of psy antenna scheme.
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
 * Possible states of psy antenna.
 */
export enum EAntennaState {
  OUTSIDE = 0,
  INSIDE = 1,
  VOID = 2,
}
