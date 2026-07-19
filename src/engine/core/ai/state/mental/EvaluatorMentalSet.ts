import { LuabindClass, property_evaluator } from "xray16";
import { TAnimationType } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { $isNil } from "xray16/macros";

import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check if target mental state is achieved.
 */
@LuabindClass()
export class EvaluatorMentalSet extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorMentalSet.__name);
    this.controller = controller;
  }

  /**
   * Check if mental desired mental state matches actual object mental state.
   */
  public override evaluate(): boolean {
    const targetMentalState: Nillable<TAnimationType> = states.get(this.controller.targetState).mental;

    return $isNil(targetMentalState) || targetMentalState === this.object.target_mental_state();
  }
}
