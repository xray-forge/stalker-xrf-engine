import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check movement type `stand` requirement in target state.
 */
@LuabindClass()
export class EvaluatorMovementStandTarget extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorMovementStandTarget.__name);
    this.controller = controller;
  }

  /**
   * Check if state requires `stand` movement type.
   */
  public override evaluate(): boolean {
    return states.get(this.controller.targetState).movement === move.stand;
  }
}
