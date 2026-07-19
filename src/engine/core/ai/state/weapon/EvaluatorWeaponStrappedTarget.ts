import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";
import { EWeaponAnimation } from "@/engine/core/animation/types";

/**
 * Whether weapon should be strapped.
 */
@LuabindClass()
export class EvaluatorWeaponStrappedTarget extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorWeaponStrappedTarget.__name);
    this.controller = controller;
  }

  /**
   * Check if target weapon state in animation is 'strapped'.
   */
  public override evaluate(): boolean {
    return states.get(this.controller.targetState).weapon === EWeaponAnimation.STRAPPED;
  }
}
