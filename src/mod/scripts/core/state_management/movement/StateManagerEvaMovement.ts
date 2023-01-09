import { property_evaluator, XR_property_evaluator } from "xray16";

import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaMovement extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaMovement: IStateManagerEvaMovement = declare_xr_class(
  "StateManagerEvaMovement",
  property_evaluator,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      // --    printf("MOVE: %s",utils.to_str((state_lib.states[this.st.target_state].movement == nil) or
      // --           (state_lib.states[this.st.target_state].movement == this.object:target_movement_type())))
      // --    printf("MOVE: %s",utils.to_str(this.object:target_movement_type()))

      return (
        states.get(this.st.target_state).movement == null ||
        states.get(this.st.target_state).movement == this.object.target_movement_type()
      );
      // --           (state_lib.states[this.st.target_state].movement == this.object:movement_type())
    }
  } as IStateManagerEvaMovement
);
