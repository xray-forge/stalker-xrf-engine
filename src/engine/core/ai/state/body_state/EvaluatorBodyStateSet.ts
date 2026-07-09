import { LuabindClass, property_evaluator } from "xray16";
import { TMoveType } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { $isNil } from "xray16/macros";

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
    const bodyState: Nillable<TMoveType> = states.get(this.stateManager.targetState).bodystate;

    return $isNil(bodyState) || bodyState === this.object.target_body_state();
  }
}
