import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { TDuration, TRate, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeOscillateState extends IBaseSchemeState {
  joint: TStringId;
  period: TDuration;
  force: TRate;
  angle: TRate;
}
