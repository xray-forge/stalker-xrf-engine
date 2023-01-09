import { action_base, move, XR_action_base } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerActMovementStand extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMovementStand: IStateManagerActMovementStand = declare_xr_class(
  "StateManagerActMovementStand",
  action_base,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      // --printf("MOVEMENT TYPE IS --- %s setting MOVEMENT TYPE --- stand", tostring(self.object:movement_type()))
      this.object.set_movement_type(move.stand);
    },
    execute(): void {
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActMovementStand
);
