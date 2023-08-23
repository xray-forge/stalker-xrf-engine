import { object } from "xray16";

import { isWeapon } from "@/engine/core/utils/object/object_class";
import { ClientObject, Optional } from "@/engine/lib/types";

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
