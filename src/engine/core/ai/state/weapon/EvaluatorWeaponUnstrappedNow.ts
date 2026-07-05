import { LuabindClass, property_evaluator } from "xray16";
import { GameObject } from "xray16/alias";
import { $isNotNil } from "xray16/macros";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { Nillable } from "@/engine/lib/types";

/**
 * Whether weapon is not strapped and in hands right now.
 */
@LuabindClass()
export class EvaluatorWeaponUnstrappedNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponUnstrappedNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if weapon currently unstrapped.
   */
  public override evaluate(): boolean {
    const activeItem: Nillable<GameObject> = this.object.active_item();
    const bestWeapon: Nillable<GameObject> = this.object.best_weapon();

    return (
      $isNotNil(activeItem) &&
      $isNotNil(bestWeapon) &&
      activeItem.id() === bestWeapon.id() &&
      !this.object.is_weapon_going_to_be_strapped(bestWeapon) &&
      this.object.weapon_unstrapped()
    );
  }
}
