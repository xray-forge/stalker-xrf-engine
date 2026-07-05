import type { TName, TProbability, TRate } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";

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
export const enum EAntennaState {
  OUTSIDE = 0,
  INSIDE = 1,
  VOID = 2,
}
