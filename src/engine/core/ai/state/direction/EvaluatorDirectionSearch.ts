import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Evaluator to check whether direction search is needed.
 * Enables actions for dynamic direction search when position is not set.
 */
@LuabindClass()
export class EvaluatorDirectionSearch extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorDirectionSearch.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether any position for look is set.
   */
  public override evaluate(): boolean {
    return !this.stateManager.lookPosition && !this.stateManager.lookObjectId;
  }
}
