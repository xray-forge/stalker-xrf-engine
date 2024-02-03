import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { isObjectWeaponLocked } from "@/engine/core/utils/weapon";

/**
 * Whether weapon state is locked and cannot be used.
 */
@LuabindClass()
export class EvaluatorWeaponLocked extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponLocked.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if weapon state is locked right now and it cannot be changed / used.
   */
  public override evaluate(): boolean {
    return isObjectWeaponLocked(this.object);
  }
}
