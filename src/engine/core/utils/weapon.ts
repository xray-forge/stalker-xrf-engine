import { anim, move, object, TXR_object_action } from "xray16";

import { states } from "@/engine/core/objects/animation/states";
import { EStalkerState, IStateDescriptor } from "@/engine/core/objects/animation/types";
import { isWeapon } from "@/engine/core/utils/class_ids";
import { ClientObject, Optional, TIndex } from "@/engine/lib/types";

/**
 * Get active weapon slot of an object for animating.
 *
 * @param object - target client object to check
 * @returns active weapon slot index
 */
export function getObjectActiveWeaponSlot(object: ClientObject): TIndex {
  const weapon: Optional<ClientObject> = object.active_item();

  if (weapon === null || object.weapon_strapped()) {
    return 0;
  }

  return weapon.animation_slot();
}

/**
 * todo;
 */
export function isObjectWeaponLocked(object: ClientObject): boolean {
  const bestWeapon: Optional<ClientObject> = object.best_weapon();

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
 * todo;
 */
export function setObjectBestWeapon(target: ClientObject): void {
  const bestWeapon: Optional<ClientObject> = target.best_weapon();

  if (bestWeapon && isWeapon(bestWeapon)) {
    target.set_item(object.idle, bestWeapon);
  }
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
export function getObjectWeaponForAnimationState(
  object: ClientObject,
  targetState: EStalkerState
): Optional<ClientObject> {
  const weaponSlot: Optional<TIndex> = states.get(targetState).weaponSlot as Optional<TIndex>;

  return weaponSlot === null ? object.best_weapon() : object.item_in_slot(weaponSlot);
}
