import { LuabindClass, property_evaluator } from "xray16";

import { states } from "@/engine/core/objects/animation/states";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether performing animation state for object.
 * Checks if current animstate is matching desired state manager state.
 */
@LuabindClass()
export class EvaluatorAnimstate extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorAnimstate.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether performing animation state for object.
   */
  public override evaluate(): boolean {
    return this.stateManager.animstate.state.currentState === states.get(this.stateManager.targetState).animstate;
  }
}
