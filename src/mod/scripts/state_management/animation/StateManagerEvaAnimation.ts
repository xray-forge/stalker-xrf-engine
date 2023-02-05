import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { states } from "@/mod/scripts/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("StateManagerEvaAnimation", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerEvaAnimation extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaAnimation: IStateManagerEvaAnimation = declare_xr_class(
  "StateManagerEvaAnimation",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      property_evaluator.__init(this, null, name);

      this.st = st;
    },
    evaluate(): boolean {
      // --printf("%s [%s] === [%s]", self.object:name(), tostring(state_lib.states[self.st.target_state].animation),
      // tostring(self.st.animation.states.current_state))
      return states.get(this.st.target_state).animation === this.st.animation.states.current_state;
    },
  } as IStateManagerEvaAnimation
);
