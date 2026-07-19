import { LuabindClass, property_evaluator } from "xray16";
import { TMoveType } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator whether body state should be changed.
 */
@LuabindClass()
export class EvaluatorBodyStateSet extends property_evaluator {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorBodyStateSet.__name);
    this.controller = controller;
  }

  /**
   * Check if changing body state is needed at the moment.
   */
  public override evaluate(): boolean {
    const bodyState: Nillable<TMoveType> = states.get(this.controller.targetState).bodystate;

    return $isNil(bodyState) || bodyState === this.object.target_body_state();
  }
}
