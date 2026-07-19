import { anim, LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Checking current mental state to be danger.
 */
@LuabindClass()
export class EvaluatorMentalDangerNow extends property_evaluator {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorMentalDangerNow.__name);
    this.controller = controller;
  }

  /**
   * Evaluate whether mental state of object is danger now.
   */
  public override evaluate(): boolean {
    return this.object.target_mental_state() === anim.danger;
  }
}
