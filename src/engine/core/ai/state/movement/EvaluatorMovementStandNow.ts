import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Evaluator to check movement type `stand` is applied now.
 */
@LuabindClass()
export class EvaluatorMovementStandNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMovementStandNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if state is set to `stand` movement action.
   */
  public override evaluate(): boolean {
    return this.object.target_movement_type() === move.stand;
  }
}
