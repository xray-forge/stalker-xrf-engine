import type { CUIStatic } from "xray16";
import type { Nillable, TCount, TLabel, TStringId } from "xray16/lib";

import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * Timer behaviour mode.
 */
export const enum ETimerType {
  INCREMENT = "inc",
  DECREMENT = "dec",
}

/**
 * Timer scheme state.
 */
export interface ISchemeTimerState extends IBaseSchemeState {
  type: ETimerType;
  startValue: TCount;
  onValue: Nillable<IBaseSchemeLogic>;
  timerId: TStringId;
  string: Nillable<TLabel>;
  timer: CUIStatic;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.SR_TIMER]: ISchemeTimerState;
  }
}
