import { LuabindClass, property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaBodyState extends property_evaluator {
  public readonly stateManager: StateManager;

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaBodyState.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    return (
      states.get(this.stateManager.target_state).bodystate === null ||
      states.get(this.stateManager.target_state).bodystate === this.object.target_body_state()
    );
  }
}
