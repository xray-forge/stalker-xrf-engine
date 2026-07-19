import { LuabindClass, property_evaluator } from "xray16";
import { $isNil } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Whether object has no weapon in hands right now.
 */
@LuabindClass()
export class EvaluatorWeaponNoneNow extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorWeaponNoneNow.__name);
    this.controller = controller;
  }

  /**
   * Check if object has no active weapon.
   */
  public override evaluate(): boolean {
    return $isNil(this.object.active_item());
  }
}
