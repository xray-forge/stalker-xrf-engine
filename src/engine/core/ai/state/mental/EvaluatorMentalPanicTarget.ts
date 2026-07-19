import { anim, LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check if mental panic state should be set.
 */
@LuabindClass()
export class EvaluatorMentalPanicTarget extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorMentalPanicTarget.__name);
    this.controller = controller;
  }

  /**
   * Check if target mental state is 'panic'.
   */
  public override evaluate(): boolean {
    return states.get(this.controller.targetState).mental === anim.panic;
  }
}
