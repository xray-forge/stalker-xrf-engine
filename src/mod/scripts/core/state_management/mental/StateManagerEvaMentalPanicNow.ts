import { anim, property_evaluator, XR_property_evaluator } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaMentalPanicNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaMentalPanicNow: IStateManagerEvaMentalPanicNow = declare_xr_class(
  "StateManagerEvaMentalPanicNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return this.object.target_mental_state() === anim.panic;
    }
  } as IStateManagerEvaMentalPanicNow
);
