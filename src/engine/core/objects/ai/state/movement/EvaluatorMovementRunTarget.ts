import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check movement type `run` requirement in target state.
 */
@LuabindClass()
export class EvaluatorMovementRunTarget extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMovementRunTarget.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if state requires `run` movement type.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).movement === move.run;
  }
}
