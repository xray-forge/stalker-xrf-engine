import { LuabindClass, property_evaluator } from "xray16";
import { GameObject } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Whether weapon is not strapped and in hands right now.
 */
@LuabindClass()
export class EvaluatorWeaponUnstrappedNow extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorWeaponUnstrappedNow.__name);
    this.controller = controller;
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
