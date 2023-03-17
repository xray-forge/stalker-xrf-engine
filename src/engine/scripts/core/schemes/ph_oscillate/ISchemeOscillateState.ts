import type { TDuration, TRate, TStringId } from "@/engine/lib/types";
import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeOscillateState extends IBaseSchemeState {
  joint: TStringId;
  period: TDuration;
  force: TRate;
  angle: TRate;
}
