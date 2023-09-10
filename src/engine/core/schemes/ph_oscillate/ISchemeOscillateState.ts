import type { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import type { TDuration, TRate, TStringId } from "@/engine/lib/types";

/**
 * Oscillation scheme logics state.
 */
export interface ISchemeOscillateState extends IBaseSchemeState {
  joint: TStringId;
  period: TDuration;
  force: TRate;
  angle: TRate;
}
