import { LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TAnimationType } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
