import { anim, move, object, TXR_object_action } from "xray16";
import { $isNil } from "xray16/macros";

import { states } from "@/engine/core/animation/states";
import { EStalkerState, IStateDescriptor } from "@/engine/core/animation/types";
import { isWeapon } from "@/engine/core/utils/class_ids";
import { GameObject, Nillable, TIndex } from "@/engine/lib/types";

/**
 * Check whether object is strapping weapon.
 *
 * @param object - Game object to check.
 * @returns Whether strapping/unstrapping weapon is in process.
 */
export function isObjectStrappingWeapon(object: GameObject): boolean {
  return !(object.weapon_unstrapped() || object.weapon_strapped());
}

/**
 * @param object - Game object to check weapon state for.
 * @returns Whether object is in locked state for the object.
 */
export function isObjectWeaponLocked(object: GameObject): boolean {
  const bestWeapon: Nillable<GameObject> = object.best_weapon();

  if ($isNil(bestWeapon)) {
    return false;
  }

  const isWeaponStrapped: boolean = object.weapon_strapped();
  const isWeaponUnstrapped: boolean = object.weapon_unstrapped();

  if (!(isWeaponUnstrapped || isWeaponStrapped)) {
    return true;
  }

  if (object.is_weapon_going_to_be_strapped(bestWeapon) && (!isWeaponStrapped || isWeaponUnstrapped)) {
    return true;
  }

  return false;
}

/**
 * Force object to get the best weapon and set it to idle state.
 *
 * @param target - Game object to force getting best weapon.
 */
export function setObjectBestWeapon(target: GameObject): void {
  const bestWeapon: Nillable<GameObject> = target.best_weapon();

  if (isWeapon(bestWeapon)) {
    target.set_item(object.idle, bestWeapon);
  }
}

/**
 * Get active weapon slot of an object for animating.
 *
 * @param object - Game object to check.
 * @returns Active weapon slot index.
 */
export function getObjectActiveWeaponSlot(object: GameObject): TIndex {
  const weapon: Nillable<GameObject> = object.active_item();

  if ($isNil(weapon) || object.weapon_strapped()) {
    return 0;
  }

  return weapon.animation_slot();
}

/**
 * Get the weapon action matching the provided animation state.
 *
 * @param targetState - Animation state to get the weapon action for.
 * @returns Weapon action to use for the animation state.
 */
export function getWeaponActionForAnimationState(targetState: EStalkerState): TXR_object_action {
  const stateDescriptor: IStateDescriptor = states.get(targetState);

  if (
    $isNil(stateDescriptor.animation) &&
    stateDescriptor.mental === anim.danger &&
    stateDescriptor.movement === move.stand
  ) {
    return object.aim1;
  } else {
    return object.idle;
  }
}

/**
 * @param object - Game object to get weapon from.
 * @param targetState - Animation state to get weapon for.
 * @returns Weapon matching desired animation state or null.
 */
export function getObjectWeaponForAnimationState(object: GameObject, targetState: EStalkerState): Nillable<GameObject> {
  const weaponSlot: Nillable<TIndex> = states.get(targetState).weaponSlot as Nillable<TIndex>;

  return $isNil(weaponSlot) ? object.best_weapon() : object.item_in_slot(weaponSlot);
}
