import { LuabindClass, property_evaluator } from "xray16";
import { $isNotNil } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Evaluator to check whether animation is playing.
 */
@LuabindClass()
export class EvaluatorAnimationPlayNow extends property_evaluator {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorAnimationPlayNow.__name);
    this.controller = controller;
  }

  /**
   * Check whether animation is playing.
   */
  public override evaluate(): boolean {
    return $isNotNil(this.controller.animationController.state.currentState);
  }
}
