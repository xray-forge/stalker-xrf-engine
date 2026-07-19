import { LuabindClass, property_evaluator } from "xray16";
import { GameObject } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { isStrappableWeapon, isWeapon } from "@/engine/core/utils/class_ids";

/**
 * Whether weapon is trapped now.
 */
@LuabindClass()
export class EvaluatorWeaponStrappedNow extends property_evaluator {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorWeaponStrappedNow.__name);
    this.controller = controller;
  }

  /**
   * Check if weapon is strapped now.
   */
  public override evaluate(): boolean {
    const bestWeapon: Nillable<GameObject> = this.object.best_weapon();

    if (!isWeapon(bestWeapon)) {
      return true;
    }

    const activeItem: Nillable<GameObject> = this.object.active_item();

    return (
      ($isNil(activeItem) && !isStrappableWeapon(bestWeapon)) ||
      (this.object.is_weapon_going_to_be_strapped(bestWeapon) && this.object.weapon_strapped())
    );
  }
}
