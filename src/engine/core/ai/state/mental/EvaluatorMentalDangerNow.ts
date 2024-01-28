import { anim, LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Checking current mental state to be danger.
 */
@LuabindClass()
export class EvaluatorMentalDangerNow extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMentalDangerNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Evaluate whether mental state of object is danger now.
   */
  public override evaluate(): boolean {
    return this.object.target_mental_state() === anim.danger;
  }
}
