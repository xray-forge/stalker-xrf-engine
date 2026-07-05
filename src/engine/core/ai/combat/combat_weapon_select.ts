import { level } from "xray16";
import { GameObject, ServerObject } from "xray16/alias";
import { Nillable, TNumberId, TStringId } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { isWeapon } from "@/engine/core/utils/class_ids";

/**
 * Try to pick the best weapon to kill enemy based on situation.
 * Returning null value will delegate choosing of weapon to game engine.
 *
 * This method leaves place for weapon custom logics implementation using events / extensions.
 *
 * @param object - Stalker object to pick the best weapon for.
 * @param weapon - Currently selected best weapon to kill enemy.
 * @returns Best weapon to use for enemy kill or null.
 */
export function selectBestStalkerWeapon(object: GameObject, weapon: Nillable<GameObject>): Nillable<GameObject> {
  const data = { weaponId: null as Nillable<TNumberId | TStringId> };

  EventsManager.emitEvent(EGameEvent.STALKER_WEAPON_SELECT, object, weapon, data);

  if (data.weaponId && typeof data.weaponId === "number") {
    const nextWeaponId: TNumberId = tonumber(data.weaponId) as TNumberId;
    const nextWeaponServerObject: Nillable<ServerObject> = registry.simulator.object(nextWeaponId);

    if (
      nextWeaponServerObject &&
      isWeapon(nextWeaponServerObject) &&
      nextWeaponServerObject.parent_id === object.id()
    ) {
      const gunObject: Nillable<GameObject> = level.object_by_id(nextWeaponId);

      if (gunObject) {
        return gunObject;
      }
    }
  }

  return null;
}
