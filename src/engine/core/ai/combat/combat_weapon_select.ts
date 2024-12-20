import { level } from "xray16";

import { registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { isWeapon } from "@/engine/core/utils/class_ids";
import { GameObject, Optional, ServerObject, TNumberId, TStringId } from "@/engine/lib/types";

/**
 * Try to pick the best weapon to kill enemy based on situation.
 * Returning null value will delegate choosing of weapon to game engine.
 *
 * This method leaves place for weapon custom logics implementation using events / extensions.
 *
 * @param object - stalker object to pick the best weapon for
 * @param weapon - currently selected best weapon to kill enemy
 * @returns best weapon to use for enemy kill or null
 */
export function selectBestStalkerWeapon(object: GameObject, weapon: Optional<GameObject>): Optional<GameObject> {
  const data = { weaponId: null as Optional<TNumberId | TStringId> };

  EventsManager.emitEvent(EGameEvent.STALKER_WEAPON_SELECT, object, weapon, data);

  if (data.weaponId && typeof data.weaponId === "number") {
    const nextWeaponId: TNumberId = tonumber(data.weaponId) as TNumberId;
    const nextWeaponServerObject: Optional<ServerObject> = registry.simulator.object(nextWeaponId);

    if (
      nextWeaponServerObject &&
      isWeapon(nextWeaponServerObject) &&
      nextWeaponServerObject.parent_id === object.id()
    ) {
      const gunObject: Optional<GameObject> = level.object_by_id(nextWeaponId);

      if (gunObject) {
        return gunObject;
      }
    }
  }

  return null;
}
