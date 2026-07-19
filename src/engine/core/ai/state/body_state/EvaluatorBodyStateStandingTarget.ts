import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check whether next body state should be standing.
 */
@LuabindClass()
export class EvaluatorBodyStateStandingTarget extends property_evaluator {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorBodyStateStandingTarget.__name);
    this.controller = controller;
  }

  /**
   * Check if standing is target body state.
   */
  public override evaluate(): boolean {
    return states.get(this.controller.targetState).bodystate === move.standing;
  }
}
