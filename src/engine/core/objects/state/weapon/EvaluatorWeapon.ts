import { LuabindClass, property_evaluator, XR_game_object } from "xray16";

import { EWeaponAnimation } from "@/engine/core/objects/state";
import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { isStrappableWeapon, isWeapon } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
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
    const weaponAnimation: Optional<EWeaponAnimation> = states.get(this.stateManager.target_state).weapon;

    if (weaponAnimation === null) {
      return true;
    }

    if (!isWeapon(this.object.best_weapon())) {
      return true;
    }

    const bestWeapon: Optional<XR_game_object> = this.object.best_weapon();
    const activeItem: Optional<XR_game_object> = this.object.active_item();

    if (
      weaponAnimation === EWeaponAnimation.STRAPPED &&
      ((isStrappableWeapon(bestWeapon) &&
        this.object.weapon_strapped() &&
        this.object.is_weapon_going_to_be_strapped(bestWeapon)) ||
        (!isStrappableWeapon(bestWeapon) && activeItem === null))
    ) {
      return true;
    }

    if (
      (weaponAnimation === EWeaponAnimation.UNSTRAPPED ||
        weaponAnimation === EWeaponAnimation.FIRE ||
        weaponAnimation === EWeaponAnimation.SNIPER_FIRE) &&
      activeItem !== null &&
      bestWeapon !== null &&
      activeItem.id() === bestWeapon.id() &&
      !this.object.is_weapon_going_to_be_strapped(bestWeapon) &&
      this.object.weapon_unstrapped()
    ) {
      return true;
    }

    if (weaponAnimation === EWeaponAnimation.NONE && activeItem === null) {
      return true;
    }

    if (weaponAnimation === EWeaponAnimation.DROP && activeItem === null) {
      return true;
    }

    return false;
  }
}
