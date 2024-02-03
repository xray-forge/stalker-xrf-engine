import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check whether next body state should be standing.
 */
@LuabindClass()
export class EvaluatorBodyStateStandingTarget extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorBodyStateStandingTarget.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if standing is target body state.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).bodystate === move.standing;
  }
}
