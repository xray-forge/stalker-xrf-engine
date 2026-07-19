import { anim, LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Checking current mental state to be panic.
 */
@LuabindClass()
export class EvaluatorMentalPanicNow extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorMentalPanicNow.__name);
    this.controller = controller;
  }

  /**
   * Check if object mental state is 'panic'.
   */
  public override evaluate(): boolean {
    return this.object.target_mental_state() === anim.panic;
  }
}
