import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Evaluator to check if body state is crouch at the moment.
 */
@LuabindClass()
export class EvaluatorBodyStateCrouchNow extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorBodyStateCrouchNow.__name);
    this.controller = controller;
  }

  /**
   * Check if crouching at the moment.
   */
  public override evaluate(): boolean {
    return this.object.target_body_state() === move.crouch;
  }
}
