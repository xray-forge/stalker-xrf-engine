import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether anim state is playing now.
 */
@LuabindClass()
export class EvaluatorAnimstatePlayNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorAnimstatePlayNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether anim state is playing now.
   */
  public override evaluate(): boolean {
    return this.stateManager.animstate.state.currentState !== null;
  }
}