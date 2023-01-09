import { action_base, anim, XR_action_base } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerActMentalPanic extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMentalPanic: IStateManagerActMentalPanic = declare_xr_class(
  "StateManagerActMentalPanic",
  action_base,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      this.object.set_mental_state(anim.panic);
    },
    execute(): void {
      action_base.execute(this);
      this.object.set_mental_state(anim.panic);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActMentalPanic
);
