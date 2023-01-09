import { property_evaluator, XR_property_evaluator } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaAnimationLocked extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaAnimationLocked: IStateManagerEvaAnimationLocked = declare_xr_class(
  "StateManagerEvaAnimationLocked",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      // --printf("anim_locked [%s] fast_set[%s] anim_marker[%s] sid[%s]", self.object:name(),
      // tostring(self.st.fast_set), tostring(self.st.animation.states.anim_marker), tostring(self.st.animation.sid))
      // --    if self.st.fast_set == true then
      // --        return false
      // --    end

      return this.st.animation.states.anim_marker !== null;
    }
  } as IStateManagerEvaAnimationLocked
);
