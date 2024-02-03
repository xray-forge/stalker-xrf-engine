import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check whether performing animation for object.
 * Checks if state manager animation is matching animation manager action.
 */
@LuabindClass()
export class EvaluatorAnimation extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorAnimation.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether currently set animation is matching state animation.
   */
  public override evaluate(): boolean {
    return this.stateManager.animation.state.currentState === states.get(this.stateManager.targetState).animation;
  }
}
