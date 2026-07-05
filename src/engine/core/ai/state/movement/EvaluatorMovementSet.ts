import { LuabindClass, property_evaluator } from "xray16";
import { TMoveType } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check if any movement set actions are needed.
 */
@LuabindClass()
export class EvaluatorMovementSet extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMovementSet.__name);
    this.stateManager = stateManager;
  }

  /**
   * Evaluate whether stalker movement state is set.
   */
  public override evaluate(): boolean {
    const targetStateMovement: Nillable<TMoveType> = states.get(this.stateManager.targetState).movement;

    return $isNil(targetStateMovement) || targetStateMovement === this.object.target_movement_type();
  }
}
