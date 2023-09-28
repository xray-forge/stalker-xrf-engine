import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, Optional, TIndex } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
