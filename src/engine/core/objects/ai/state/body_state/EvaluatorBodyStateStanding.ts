import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether next body state should be standing.
 */
@LuabindClass()
export class EvaluatorBodyStateStanding extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorBodyStateStanding.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if standing is target body state.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).bodystate === move.standing;
  }
}
