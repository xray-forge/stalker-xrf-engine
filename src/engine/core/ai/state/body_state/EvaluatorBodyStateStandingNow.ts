import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Evaluator to check whether standing right now.
 */
@LuabindClass()
export class EvaluatorBodyStateStandingNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorBodyStateStandingNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if standing is current body state.
   */
  public override evaluate(): boolean {
    return this.object.target_body_state() === move.standing;
  }
}
