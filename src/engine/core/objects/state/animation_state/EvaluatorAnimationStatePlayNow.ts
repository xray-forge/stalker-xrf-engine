import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether anim state is playing now.
 */
@LuabindClass()
export class EvaluatorAnimationStatePlayNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorAnimationStatePlayNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether anim state is playing now.
   */
  public override evaluate(): boolean {
    return this.stateManager.animstate.states.currentState !== null;
  }
}
