import { XR_game_object } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { registerZone, unregisterZone } from "@/engine/core/database/zones";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";

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
