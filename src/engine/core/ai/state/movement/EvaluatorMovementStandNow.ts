import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Evaluator to check movement type `stand` is applied now.
 */
@LuabindClass()
export class EvaluatorMovementStandNow extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorMovementStandNow.__name);
    this.controller = controller;
  }

  /**
   * Check if state is set to `stand` movement action.
   */
  public override evaluate(): boolean {
    return this.object.target_movement_type() === move.stand;
  }
}
