import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { isStrappableWeapon, isWeapon } from "@/engine/core/utils/class_ids";
import { GameObject, Optional } from "@/engine/lib/types";

/**
 * Whether weapon is trapped now.
 */
@LuabindClass()
export class EvaluatorWeaponStrappedNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponStrappedNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if weapon is strapped now.
   */
  public override evaluate(): boolean {
    const bestWeapon: Optional<GameObject> = this.object.best_weapon();

    if (!isWeapon(bestWeapon)) {
      return true;
    }

    const activeItem: Optional<GameObject> = this.object.active_item();

    return (
      (activeItem === null && !isStrappableWeapon(bestWeapon)) ||
      (this.object.is_weapon_going_to_be_strapped(bestWeapon) && this.object.weapon_strapped())
    );
  }
}
