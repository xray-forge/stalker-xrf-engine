import { XR_game_object } from "xray16";

import { registry } from "@/engine/scripts/core/database/registry";
import { registerZone, unregisterZone } from "@/engine/scripts/core/database/zones";
import { SmartTerrain } from "@/engine/scripts/core/objects/alife/smart/SmartTerrain";

/**
 * todo;
 */
export function registerSmartTerrain(object: XR_game_object, cseObject: SmartTerrain): void {
  registerZone(object);
  registry.smartTerrains.set(cseObject.id, cseObject);
}

/**
 * todo;
 */
export function unregisterSmartTerrain(object: XR_game_object, cseObject: SmartTerrain): void {
  unregisterZone(object);
  registry.smartTerrains.delete(cseObject.id);
}
