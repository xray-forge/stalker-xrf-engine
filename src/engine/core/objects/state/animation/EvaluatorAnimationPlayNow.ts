import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether animation is playing.
 */
@LuabindClass()
export class EvaluatorAnimationPlayNow extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorAnimationPlayNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether animation is playing.
   */
  public override evaluate(): boolean {
    return this.stateManager.animation.states.currentState !== null;
  }
}
