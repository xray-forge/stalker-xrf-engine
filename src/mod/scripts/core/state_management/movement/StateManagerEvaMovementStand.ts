import { move, property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaMovementStand",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaMovementStand extends property_evaluator {
  public readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaMovementStand.__name);

    this.stateManager = stateManager;
  }

  public evaluate(): boolean {
    return states.get(this.stateManager.target_state).movement === move.stand;
  }
}
