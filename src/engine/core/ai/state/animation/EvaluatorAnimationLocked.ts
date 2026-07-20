import { LuabindClass, property_evaluator } from "xray16";
import { $isNotNil } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Evaluator to check whether performed animation is locked and cannot be interrupted at the moment.
 * Verifies that animation marker is at some progression state.
 */
@LuabindClass()
export class EvaluatorAnimationLocked extends property_evaluator {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorAnimationLocked.__name);
    this.controller = controller;
  }

  /**
   * Check whether any animation marker is active.
   */
  public override evaluate(): boolean {
    return $isNotNil(this.controller.animationController.state.animationMarker);
  }
}
