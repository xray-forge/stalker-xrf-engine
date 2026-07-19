import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";
import { EWeaponAnimation } from "@/engine/core/animation/types";

/**
 * Whether object should hide weapon.
 */
@LuabindClass()
export class EvaluatorWeaponNoneTarget extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorWeaponNoneTarget.__name);
    this.controller = controller;
  }

  /**
   * Check if weapon target state in animation is 'none'.
   */
  public override evaluate(): boolean {
    return states.get(this.controller.targetState).weapon === EWeaponAnimation.NONE;
  }
}
