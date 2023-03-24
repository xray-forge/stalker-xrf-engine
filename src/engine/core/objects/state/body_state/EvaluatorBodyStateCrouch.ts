import { LuabindClass, move, property_evaluator } from "xray16";

import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorBodyStateCrouch extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorBodyStateCrouch.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if crouching is target state.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.target_state).bodystate === move.crouch;
  }
}
