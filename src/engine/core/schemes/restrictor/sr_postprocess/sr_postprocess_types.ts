import type { TRate } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EScheme } from "@/engine/lib/types";

/**
 * State of post-processing scheme logics.
 */
export interface ISchemePostProcessState extends IBaseSchemeState {
  intensity: TRate;
  intensitySpeed: TRate;
  hitIntensity: TRate;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.SR_POSTPROCESS]: ISchemePostProcessState;
  }
}
