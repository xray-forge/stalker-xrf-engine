import { LuabindClass, property_evaluator } from "xray16";
import { $isNil } from "xray16/macros";

import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";
import { Nillable, TAnimationType } from "@/engine/lib/types";

/**
 * Evaluator to check if target mental state is achieved.
 */
@LuabindClass()
export class EvaluatorMentalSet extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMentalSet.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if mental desired mental state matches actual object mental state.
   */
  public override evaluate(): boolean {
    const targetMentalState: Nillable<TAnimationType> = states.get(this.stateManager.targetState).mental;

    return $isNil(targetMentalState) || targetMentalState === this.object.target_mental_state();
  }
}
