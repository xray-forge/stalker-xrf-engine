import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Evaluator to check whether direction search is needed.
 * Enables actions for dynamic direction search when position is not set.
 */
@LuabindClass()
export class EvaluatorDirectionSearch extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorDirectionSearch.__name);
    this.controller = controller;
  }

  /**
   * Check whether any position for look is set.
   */
  public override evaluate(): boolean {
    return !this.controller.lookPosition && !this.controller.lookObjectId;
  }
}
