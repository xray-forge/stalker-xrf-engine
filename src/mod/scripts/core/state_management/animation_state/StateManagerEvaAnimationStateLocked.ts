import { anim, property_evaluator, XR_property_evaluator } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaAnimationStateLocked extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaAnimationStateLocked: IStateManagerEvaAnimationStateLocked = declare_xr_class(
  "StateManagerEvaAnimationStateLocked",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      // --    if self.st.fast_set == true then
      // --        return false
      // --    end

      return this.st.animstate.states.anim_marker !== null && this.st.animstate.states.anim_marker !== anim.lie_idle;
    }
  } as IStateManagerEvaAnimationStateLocked
);
