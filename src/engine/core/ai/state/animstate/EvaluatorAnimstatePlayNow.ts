import { LuabindClass, property_evaluator } from "xray16";
import { $isNotNil } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Evaluator to check whether anim state is playing now.
 */
@LuabindClass()
export class EvaluatorAnimstatePlayNow extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorAnimstatePlayNow.__name);
    this.controller = controller;
  }

  /**
   * Check whether anim state is playing now.
   */
  public override evaluate(): boolean {
    return $isNotNil(this.controller.animstate.state.currentState);
  }
}
