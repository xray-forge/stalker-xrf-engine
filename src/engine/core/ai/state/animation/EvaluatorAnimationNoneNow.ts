import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether no current animation is active.
 */
@LuabindClass()
export class EvaluatorAnimationNoneNow extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorAnimationNoneNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether current animation state is not null.
   */
  public override evaluate(): boolean {
    return this.stateManager.animation.state.currentState === null;
  }
}
