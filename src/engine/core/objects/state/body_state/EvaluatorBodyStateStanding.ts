import { LuabindClass, move, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
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
