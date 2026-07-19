import { anim, LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Checking current mental state to be free.
 */
@LuabindClass()
export class EvaluatorMentalFreeNow extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorMentalFreeNow.__name);
    this.controller = controller;
  }

  /**
   * Check if current mental state is 'free'.
   */
  public override evaluate(): boolean {
    return this.object.target_mental_state() === anim.free;
  }
}
