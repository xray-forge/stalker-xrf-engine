import { anim, property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaMentalDangerNow",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaMentalDangerNow extends property_evaluator {
  public readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaMentalDangerNow.__name);
    this.stateManager = stateManager;
  }

  public evaluate(): boolean {
    return this.object.target_mental_state() === anim.danger;
  }
}
