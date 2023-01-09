import { action_base, anim, move, XR_action_base } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerActBodyStateCrouchDanger extends XR_action_base {
  st: StateManager;
}

export const StateManagerActBodyStateCrouchDanger: IStateManagerActBodyStateCrouchDanger = declare_xr_class(
  "StateManagerActBodyStateCrouchDanger",
  action_base,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);

      this.object.set_mental_state(anim.danger);
      this.object.set_body_state(move.crouch);
    },
    execute(): void {
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActBodyStateCrouchDanger
);
