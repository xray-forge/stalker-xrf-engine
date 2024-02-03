import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";
import { EWeaponAnimation } from "@/engine/core/animation/types";
import { isStrappableWeapon } from "@/engine/core/utils/class_ids";
import { GameObject, Optional } from "@/engine/lib/types";

/**
 * Whether current active weapon matches required weapon.
 * Check if object needs weapon at all and whether it is the best possible one.
 */
@LuabindClass()
export class EvaluatorWeaponSet extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponSet.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    const weaponAnimation: Optional<EWeaponAnimation> = states.get(this.stateManager.targetState).weapon;

    if (weaponAnimation === null) {
      return true;
    }

    const activeItem: Optional<GameObject> = this.object.active_item();

    if (
      activeItem === null &&
      (weaponAnimation === EWeaponAnimation.NONE ||
        weaponAnimation === EWeaponAnimation.STRAPPED ||
        weaponAnimation === EWeaponAnimation.DROP)
    ) {
      return true;
    }

    const bestWeapon: Optional<GameObject> = this.object.best_weapon();

    if (bestWeapon === null) {
      return false;
    }

    if (activeItem?.id() !== bestWeapon.id()) {
      return false;
    }

    if (weaponAnimation === EWeaponAnimation.STRAPPED) {
      return (
        isStrappableWeapon(bestWeapon) &&
        this.object.weapon_strapped() &&
        this.object.is_weapon_going_to_be_strapped(bestWeapon)
      );
    }

    if (
      (weaponAnimation === EWeaponAnimation.UNSTRAPPED ||
        weaponAnimation === EWeaponAnimation.FIRE ||
        weaponAnimation === EWeaponAnimation.SNIPER_FIRE) &&
      !this.object.is_weapon_going_to_be_strapped(bestWeapon) &&
      this.object.weapon_unstrapped()
    ) {
      return true;
    }

    return false;
  }
}
