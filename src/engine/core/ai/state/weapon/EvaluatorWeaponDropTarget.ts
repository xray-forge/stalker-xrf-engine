import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";
import { EWeaponAnimation } from "@/engine/core/animation/types/animation_types";

/**
 * Whether object should drop weapon.
 */
@LuabindClass()
export class EvaluatorWeaponDropTarget extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorWeaponDropTarget.__name);
    this.controller = controller;
  }

  /**
   * Check whether target state requires weapon drop.
   */
  public override evaluate(): boolean {
    return states.get(this.controller.targetState).weapon === EWeaponAnimation.DROP;
  }
}
