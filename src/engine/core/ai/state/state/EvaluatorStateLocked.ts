import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStateEvaluatorId } from "@/engine/core/ai/state/types";

/**
 * Check if manager state is locked currently.
 * Should wait for body to turn / for weapon animation to finish.
 */
@LuabindClass()
export class EvaluatorStateLocked extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorStateLocked.__name);
    this.controller = controller;
  }

  /**
   * Check if state is locked and cannot be changed in this period.
   */
  public override evaluate(): boolean {
    return (
      this.controller.planner.initialized() &&
      (this.controller.planner.evaluator(EStateEvaluatorId.WEAPON_LOCKED).evaluate() || this.object.is_body_turning())
    );
  }
}
