import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Evaluator to check whether performed animation is locked and cannot be interrupted at the moment.
 * Verifies that animation marker is at some progression state.
 */
@LuabindClass()
export class EvaluatorAnimationLocked extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorAnimationLocked.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether any animation marker is active.
   */
  public override evaluate(): boolean {
    return this.stateManager.animation.state.animationMarker !== null;
  }
}
