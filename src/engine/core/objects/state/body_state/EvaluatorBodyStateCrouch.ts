import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether body state should be changed to crouch.
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
    return states.get(this.stateManager.targetState).bodystate === move.crouch;
  }
}
