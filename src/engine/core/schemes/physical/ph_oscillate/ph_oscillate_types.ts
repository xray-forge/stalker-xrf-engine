import type { TDuration, TRate, TStringId } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";

/**
 * Oscillation scheme logics state.
 */
export interface ISchemeOscillateState extends IBaseSchemeState {
  joint: TStringId;
  period: TDuration;
  force: TRate;
  angle: TRate;
}
