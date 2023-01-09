import { anim, property_evaluator, XR_property_evaluator } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaMentalDangerNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaMentalDangerNow: IStateManagerEvaMentalDangerNow = declare_xr_class(
  "StateManagerEvaMentalDangerNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return this.object.target_mental_state() === anim.danger;
    }
  } as IStateManagerEvaMentalDangerNow
);
