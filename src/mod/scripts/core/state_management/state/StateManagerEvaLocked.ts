import { property_evaluator, XR_property_evaluator } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaLocked extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaLocked: IStateManagerEvaLocked = declare_xr_class(
  "StateManagerEvaLocked",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      // --printf("%s weapon locked %s", self.object:name(),
      // tostring(self.st.planner:evaluator(self.st.properties["weapon_locked"]):evaluate()))
      // --printf("%s turning %s", self.object:name(), tostring(self.object:is_body_turning()))

      return (
        this.st.planner!.initialized() &&
        (this.st.planner!.evaluator(this.st.properties.get("weapon_locked")).evaluate() ||
          this.object.is_body_turning())
      );
    }
  } as IStateManagerEvaLocked
);
