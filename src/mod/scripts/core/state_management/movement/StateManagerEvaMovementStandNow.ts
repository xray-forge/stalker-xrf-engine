import { move, property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerEvaMovementStandNow",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerEvaMovementStandNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaMovementStandNow: IStateManagerEvaMovementStandNow = declare_xr_class(
  "StateManagerEvaMovementStandNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return this.object.target_movement_type() === move.stand;
      // --    return this.object:movement_type() == move.stand
    }
  } as IStateManagerEvaMovementStandNow
);
