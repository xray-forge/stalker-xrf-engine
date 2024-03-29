import { anim, LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Checking current mental state to be free.
 */
@LuabindClass()
export class EvaluatorMentalFreeNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMentalFreeNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if current mental state is 'free'.
   */
  public override evaluate(): boolean {
    return this.object.target_mental_state() === anim.free;
  }
}
