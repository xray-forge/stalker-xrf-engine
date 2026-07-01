import type { CUIStatic } from "xray16";

import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/database/database_types";
import type { Nillable, TCount, TLabel, TStringId } from "@/engine/lib/types";

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
  onValue: Nillable<IBaseSchemeLogic>;
  timerId: TStringId;
  string: Nillable<TLabel>;
  timer: CUIStatic;
}
