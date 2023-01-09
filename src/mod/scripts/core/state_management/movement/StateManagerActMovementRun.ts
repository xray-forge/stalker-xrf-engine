import { action_base, move, XR_action_base } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerActMovementRun extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMovementRun: IStateManagerActMovementRun = declare_xr_class(
  "StateManagerActMovementRun",
  action_base,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      // --printf("MOVEMENT TYPE IS --- %s setting MOVEMENT TYPE --- RUN", tostring(self.object:movement_type()))
      this.object.set_movement_type(move.run);
      // --    printf("ENABLING MOVEMENT !!!!!")
      // --'self.object:movement_enabled(true)
      // --printf("MOVEMENT TYPE IS --- %s setting MOVEMENT TYPE --- RUN", tostring(self.object:movement_type()))
    },
    execute(): void {
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActMovementRun
);
