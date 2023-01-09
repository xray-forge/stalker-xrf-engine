import { property_evaluator, XR_property_evaluator } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaAnimationNoneNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaAnimationNoneNow: IStateManagerEvaAnimationNoneNow = declare_xr_class(
  "StateManagerEvaAnimationNoneNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return this.st.animation.states.current_state == null;
    }
  } as IStateManagerEvaAnimationNoneNow
);
