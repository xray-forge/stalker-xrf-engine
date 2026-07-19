import { LuabindClass, property_evaluator } from "xray16";
import { TMoveType } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check if any movement set actions are needed.
 */
@LuabindClass()
export class EvaluatorMovementSet extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorMovementSet.__name);
    this.controller = controller;
  }

  /**
   * Evaluate whether stalker movement state is set.
   */
  public override evaluate(): boolean {
    const targetStateMovement: Nillable<TMoveType> = states.get(this.controller.targetState).movement;

    return $isNil(targetStateMovement) || targetStateMovement === this.object.target_movement_type();
  }
}
