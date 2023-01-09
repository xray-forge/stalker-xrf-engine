import { move, property_evaluator, XR_property_evaluator } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaBodyStateStandingNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaBodyStateStandingNow: IStateManagerEvaBodyStateStandingNow = declare_xr_class(
  "StateManagerEvaBodyStateStandingNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return this.object.target_body_state() == move.standing;
    }
  } as IStateManagerEvaBodyStateStandingNow
);
