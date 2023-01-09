import { action_base, anim, XR_action_base } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerActMentalDanger extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMentalDanger: IStateManagerActMentalDanger = declare_xr_class(
  "StateManagerActMentalDanger",
  action_base,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      this.object.set_mental_state(anim.danger);
    },
    execute(): void {
      action_base.execute(this);
      this.object.set_mental_state(anim.danger);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActMentalDanger
);
