import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EWeaponAnimation } from "@/engine/core/objects/animation";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isStrappableWeapon } from "@/engine/core/utils/object";
import { ClientObject, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Whether current active weapon matches required weapon.
 * Check if object needs weapon at all and whether it is the best possible one.
 */
@LuabindClass()
export class EvaluatorWeapon extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeapon.__name);
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

    const activeItem: Optional<ClientObject> = this.object.active_item();

    if (
      activeItem === null &&
      (weaponAnimation === EWeaponAnimation.NONE ||
        weaponAnimation === EWeaponAnimation.STRAPPED ||
        weaponAnimation === EWeaponAnimation.DROP)
    ) {
      return true;
    }

    const bestWeapon: Optional<ClientObject> = this.object.best_weapon();

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
