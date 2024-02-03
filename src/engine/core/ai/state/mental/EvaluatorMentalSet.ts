import { LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";
import { Optional, TAnimationType } from "@/engine/lib/types";

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
    const targetMentalState: Optional<TAnimationType> = states.get(this.stateManager.targetState).mental;

    return targetMentalState === null || targetMentalState === this.object.target_mental_state();
  }
}
