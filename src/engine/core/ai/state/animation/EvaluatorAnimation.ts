import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check whether performing animation for object.
 * Checks if state controller animation is matching animation manager action.
 */
@LuabindClass()
export class EvaluatorAnimation extends property_evaluator {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorAnimation.__name);
    this.controller = controller;
  }

  /**
   * Check whether currently set animation is matching state animation.
   */
  public override evaluate(): boolean {
    return this.controller.animationController.state.currentState === states.get(this.controller.targetState).animation;
  }
}
