import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";

/**
 * Evaluator to check whether performing animation state for object.
 * Checks if current animstate is matching desired state controller state.
 */
@LuabindClass()
export class EvaluatorAnimstate extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorAnimstate.__name);
    this.controller = controller;
  }

  /**
   * Check whether performing animation state for object.
   */
  public override evaluate(): boolean {
    return this.controller.animstateController.state.currentState === states.get(this.controller.targetState).animstate;
  }
}
