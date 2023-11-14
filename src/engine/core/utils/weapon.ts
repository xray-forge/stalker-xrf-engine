import { anim, move, object, TXR_object_action } from "xray16";

import { states } from "@/engine/core/animation/states";
import { EStalkerState, IStateDescriptor } from "@/engine/core/animation/types";
import { isWeapon } from "@/engine/core/utils/class_ids";
import { GameObject, Optional, TIndex } from "@/engine/lib/types";

/**
 * Check whether object is strapping weapon.
 *
 * @param object - target game object to check
 * @returns whether strapping/unstrapping weapon is in process
 */
export function isObjectStrappingWeapon(object: GameObject): boolean {
  return !(object.weapon_unstrapped() || object.weapon_strapped());
}

/**
 * @param object - target game object to check weapon state for
 * @returns whether object is in locked state for the object
 */
export function isObjectWeaponLocked(object: GameObject): boolean {
  const bestWeapon: Optional<GameObject> = object.best_weapon();

  if (bestWeapon === null) {
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
 * @param target - target game object to force getting best weapon
 */
export function setObjectBestWeapon(target: GameObject): void {
  const bestWeapon: Optional<GameObject> = target.best_weapon();

  if (isWeapon(bestWeapon)) {
    target.set_item(object.idle, bestWeapon);
  }
}

/**
 * Get active weapon slot of an object for animating.
 *
 * @param object - target game object to check
 * @returns active weapon slot index
 */
export function getObjectActiveWeaponSlot(object: GameObject): TIndex {
  const weapon: Optional<GameObject> = object.active_item();

  if (weapon === null || object.weapon_strapped()) {
    return 0;
  }

  return weapon.animation_slot();
}

/**
 * todo;
 */
export function getWeaponActionForAnimationState(targetState: EStalkerState): TXR_object_action {
  const stateDescriptor: IStateDescriptor = states.get(targetState);

  if (
    stateDescriptor.animation === null &&
    stateDescriptor.mental === anim.danger &&
    stateDescriptor.movement === move.stand
  ) {
    return object.aim1;
  } else {
    return object.idle;
  }
}

/**
 * todo;
 */
export function getObjectWeaponForAnimationState(object: GameObject, targetState: EStalkerState): Optional<GameObject> {
  const weaponSlot: Optional<TIndex> = states.get(targetState).weaponSlot as Optional<TIndex>;

  return weaponSlot === null ? object.best_weapon() : object.item_in_slot(weaponSlot);
}
