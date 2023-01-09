import { move, property_evaluator, XR_property_evaluator } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaBodyStateCrouchNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaBodyStateCrouchNow: IStateManagerEvaBodyStateCrouchNow = declare_xr_class(
  "StateManagerEvaBodyStateCrouchNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return this.object.target_body_state() == move.crouch;
    }
  } as IStateManagerEvaBodyStateCrouchNow
);
