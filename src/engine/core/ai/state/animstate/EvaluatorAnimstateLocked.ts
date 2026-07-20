import { LuabindClass, property_evaluator } from "xray16";
import { $isNotNil } from "xray16/macros";

import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EAnimationMarker } from "@/engine/core/animation/types/animation_types";

/**
 * Evaluator to check whether anim state is locked now.
 */
@LuabindClass()
export class EvaluatorAnimstateLocked extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorAnimstateLocked.__name);
    this.controller = controller;
  }

  /**
   * Check whether anim state is locked now.
   */
  public override evaluate(): boolean {
    const animationMarker = this.controller.animstateController.state.animationMarker;

    return $isNotNil(animationMarker) && animationMarker !== EAnimationMarker.IDLE;
  }
}
