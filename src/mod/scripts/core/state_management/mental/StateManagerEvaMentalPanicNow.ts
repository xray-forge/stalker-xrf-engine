import { action_base, anim, property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaMentalPanicNow",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerEvaMentalPanicNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaMentalPanicNow: IStateManagerEvaMentalPanicNow = declare_xr_class(
  "StateManagerEvaMentalPanicNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager) {
      property_evaluator.__init(this, null, name);

      this.st = st;
    },
    evaluate(): boolean {
      return this.object.target_mental_state() === anim.panic;
    },
  } as IStateManagerEvaMentalPanicNow
);
