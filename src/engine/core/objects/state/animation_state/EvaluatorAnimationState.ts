import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether performing animation state for object.
 */
@LuabindClass()
export class EvaluatorAnimationState extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorAnimationState.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether performing animation state for object.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).animstate === this.stateManager.animstate.states.currentState;
  }
}
