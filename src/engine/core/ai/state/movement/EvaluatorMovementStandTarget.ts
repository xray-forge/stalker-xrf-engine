import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check movement type `stand` requirement in target state.
 */
@LuabindClass()
export class EvaluatorMovementStandTarget extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMovementStandTarget.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if state requires `stand` movement type.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).movement === move.stand;
  }
}
