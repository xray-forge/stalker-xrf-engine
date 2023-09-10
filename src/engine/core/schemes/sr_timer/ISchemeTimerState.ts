import type { CUIStatic } from "xray16";

import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import type { Optional, TCount, TLabel, TStringId } from "@/engine/lib/types";

/**
 * Timer behaviour mode.
 */
export enum ETimerType {
  INCREMENT = "inc",
  DECREMENT = "dec",
}

/**
 * Timer scheme state.
 */
export interface ISchemeTimerState extends IBaseSchemeState {
  type: ETimerType;
  startValue: TCount;
  onValue: Optional<IBaseSchemeLogic>;
  timerId: TStringId;
  string: Optional<TLabel>;
  timer: CUIStatic;
}
