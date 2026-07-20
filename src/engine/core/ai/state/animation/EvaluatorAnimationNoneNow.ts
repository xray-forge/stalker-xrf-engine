import { LuabindClass, property_evaluator } from "xray16";
import { $isNil } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Evaluator to check whether no current animation is active.
 */
@LuabindClass()
export class EvaluatorAnimationNoneNow extends property_evaluator {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorAnimationNoneNow.__name);
    this.controller = controller;
  }

  /**
   * Check whether current animation state is not null.
   */
  public override evaluate(): boolean {
    return $isNil(this.controller.animationController.state.currentState);
  }
}
