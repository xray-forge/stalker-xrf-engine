import { LuabindClass, property_evaluator } from "xray16";
import { $isNotNil } from "xray16/macros";

import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EAnimationMarker } from "@/engine/core/animation/types/animation_types";

/**
 * Evaluator to check whether anim state is locked now.
 */
@LuabindClass()
export class EvaluatorAnimstateLocked extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorAnimstateLocked.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether anim state is locked now.
   */
  public override evaluate(): boolean {
    const animationMarker = this.stateManager.animstate.state.animationMarker;

    return $isNotNil(animationMarker) && animationMarker !== EAnimationMarker.IDLE;
  }
}
