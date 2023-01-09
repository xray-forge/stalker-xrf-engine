import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerEvaAnimationStatePlayNow",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerEvaAnimationStatePlayNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaAnimationStatePlayNow: IStateManagerEvaAnimationStatePlayNow = declare_xr_class(
  "StateManagerEvaAnimationStatePlayNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return this.st.animstate.states.current_state !== null;
    }
  } as IStateManagerEvaAnimationStatePlayNow
);
