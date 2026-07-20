import { LuabindClass, property_evaluator } from "xray16";
import { $isNil } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Evaluator to check whether animation current state is idle.
 */
@LuabindClass()
export class EvaluatorAnimstateIdleNow extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorAnimstateIdleNow.__name);
    this.controller = controller;
  }

  /**
   * Check whether animation current state is idle.
   */
  public override evaluate(): boolean {
    return $isNil(this.controller.animstateController.state.currentState);
  }
}
