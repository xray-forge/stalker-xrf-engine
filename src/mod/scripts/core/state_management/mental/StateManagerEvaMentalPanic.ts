import { anim, property_evaluator, XR_property_evaluator } from "xray16";

import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaMentalPanic extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaMentalPanic: IStateManagerEvaMentalPanic = declare_xr_class(
  "StateManagerEvaMentalPanic",
  property_evaluator,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return states.get(this.st.target_state).mental === anim.panic;
    }
  } as IStateManagerEvaMentalPanic
);
