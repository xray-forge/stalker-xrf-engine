import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator whether body state should be changed.
 */
@LuabindClass()
export class EvaluatorBodyStateSet extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorBodyStateSet.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if changing body state is needed at the moment.
   */
  public override evaluate(): boolean {
    return (
      states.get(this.stateManager.targetState).bodystate === null ||
      states.get(this.stateManager.targetState).bodystate === this.object.target_body_state()
    );
  }
}
