import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Check if state controller is locked by current alife or alife activity.
 * It means that state controller cannot control object, another activity fully controls.
 */
@LuabindClass()
export class EvaluatorStateLockedExternal extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorStateLockedExternal.__name);
    this.controller = controller;
  }

  /**
   * Evaluate whether the state controller is externally locked by ongoing combat or alife activity.
   *
   * @returns Whether the object state is controlled by an external activity.
   */
  public override evaluate(): boolean {
    return this.controller.isCombat || this.controller.isAlife;
  }
}
