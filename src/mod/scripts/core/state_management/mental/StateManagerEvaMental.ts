import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("StateManagerEvaMental", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerEvaMental extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaMental: IStateManagerEvaMental = declare_xr_class(
  "StateManagerEvaMental",
  property_evaluator,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return (
        states.get(this.st.target_state).mental === null ||
        states.get(this.st.target_state).mental === this.object.target_mental_state()
      );
    }
  } as IStateManagerEvaMental
);
