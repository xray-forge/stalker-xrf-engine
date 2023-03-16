import type { TDuration, TRate, TStringId } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";

/**
 * todo;
 */
export interface ISchemeOscillateState extends IBaseSchemeState {
  joint: TStringId;
  period: TDuration;
  force: TRate;
  angle: TRate;
}
