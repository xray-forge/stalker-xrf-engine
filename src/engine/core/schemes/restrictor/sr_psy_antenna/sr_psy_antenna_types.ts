import type { TName, TProbability, TRate } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/lib/types";

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

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.SR_PSY_ANTENNA]: ISchemePsyAntennaState;
  }
}
