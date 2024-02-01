import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Evaluator to check whether animation current state is idle.
 */
@LuabindClass()
export class EvaluatorAnimstateIdleNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorAnimstateIdleNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether animation current state is idle.
   */
  public override evaluate(): boolean {
    return this.stateManager.animstate.state.currentState === null;
  }
}
