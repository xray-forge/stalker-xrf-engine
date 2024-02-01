import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check whether body state should be changed to crouch.
 */
@LuabindClass()
export class EvaluatorBodyStateCrouchTarget extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorBodyStateCrouchTarget.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if crouching is target state.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).bodystate === move.crouch;
  }
}
