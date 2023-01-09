import { move, property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerEvaBodyStateStandingNow",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerEvaBodyStateStandingNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaBodyStateStandingNow: IStateManagerEvaBodyStateStandingNow = declare_xr_class(
  "StateManagerEvaBodyStateStandingNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return this.object.target_body_state() === move.standing;
    }
  } as IStateManagerEvaBodyStateStandingNow
);
