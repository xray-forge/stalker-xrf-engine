import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check whether body state should be changed to crouch.
 */
@LuabindClass()
export class EvaluatorBodyStateCrouchTarget extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorBodyStateCrouchTarget.__name);
    this.controller = controller;
  }

  /**
   * Check if crouching is target state.
   */
  public override evaluate(): boolean {
    return states.get(this.controller.targetState).bodystate === move.crouch;
  }
}
