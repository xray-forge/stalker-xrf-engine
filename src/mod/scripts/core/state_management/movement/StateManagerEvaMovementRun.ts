import { move, property_evaluator, XR_property_evaluator } from "xray16";

import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaMovementRun extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaMovementRun: IStateManagerEvaMovementRun = declare_xr_class(
  "StateManagerEvaMovementRun",
  property_evaluator,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return states.get(this.st.target_state).movement == move.run;
    }
  } as IStateManagerEvaMovementRun
);
