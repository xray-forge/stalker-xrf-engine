import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TMoveType } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorMovement extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMovement.__name);
    this.stateManager = stateManager;
  }

  /**
   * Evaluate whether stalker is moving in animation state.
   */
  public override evaluate(): boolean {
    const targetStateMovement: Optional<TMoveType> = states.get(this.stateManager.targetState).movement;

    return targetStateMovement === null || targetStateMovement === this.object.target_movement_type();
  }
}
