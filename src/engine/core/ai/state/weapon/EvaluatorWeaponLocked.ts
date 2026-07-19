import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { isObjectWeaponLocked } from "@/engine/core/utils/weapon";

/**
 * Whether weapon state is locked and cannot be used.
 */
@LuabindClass()
export class EvaluatorWeaponLocked extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorWeaponLocked.__name);
    this.controller = controller;
  }

  /**
   * Check if weapon state is locked right now and it cannot be changed / used.
   */
  public override evaluate(): boolean {
    return isObjectWeaponLocked(this.object);
  }
}
