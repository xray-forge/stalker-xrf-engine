import { property_evaluator, XR_property_evaluator } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaAnimationPlayNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaAnimationPlayNow: IStateManagerEvaAnimationPlayNow = declare_xr_class(
  "StateManagerEvaAnimationPlayNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return this.st.animation.states.current_state !== null;
    }
  } as IStateManagerEvaAnimationPlayNow
);
