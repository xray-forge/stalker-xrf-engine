import type { TDuration, TRate, TStringId } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { EScheme } from "@/engine/lib/types";

/**
 * Oscillation scheme logics state.
 */
export interface ISchemeOscillateState extends IBaseSchemeState {
  joint: TStringId;
  period: TDuration;
  force: TRate;
  angle: TRate;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.PH_OSCILLATE]: ISchemeOscillateState;
  }
}
