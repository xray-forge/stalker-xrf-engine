import { LuabindClass, move, property_evaluator } from "xray16";

import { states } from "@/engine/core/objects/animation/states";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorMovementStand extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMovementStand.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).movement === move.stand;
  }
}
