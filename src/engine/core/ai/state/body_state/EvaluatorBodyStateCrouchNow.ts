import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Evaluator to check if body state is crouch at the moment.
 */
@LuabindClass()
export class EvaluatorBodyStateCrouchNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorBodyStateCrouchNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if crouching at the moment
   */
  public override evaluate(): boolean {
    return this.object.target_body_state() === move.crouch;
  }
}
