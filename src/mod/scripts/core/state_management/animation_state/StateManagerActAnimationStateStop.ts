import { action_base, XR_action_base } from "xray16";

import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerActAnimationStateStop extends XR_action_base {
  st: StateManager;
}

export const StateManagerActAnimationStateStop: IStateManagerActAnimationStateStop = declare_xr_class(
  "StateManagerActAnimationStateStop",
  action_base,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);

      this.st.animstate.set_state(null, this.st.fast_set || states.get(this.st.target_state).fast_set!);
      this.st.animstate.set_control();
    },
    execute(): void {
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActAnimationStateStop
);
