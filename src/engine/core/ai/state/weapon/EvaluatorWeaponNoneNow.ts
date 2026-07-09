import { LuabindClass, property_evaluator } from "xray16";
import { $isNil } from "xray16/macros";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Whether object has no weapon in hands right now.
 */
@LuabindClass()
export class EvaluatorWeaponNoneNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponNoneNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if object has no active weapon.
   */
  public override evaluate(): boolean {
    return $isNil(this.object.active_item());
  }
}
