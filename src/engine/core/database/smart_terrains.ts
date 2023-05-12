import { XR_game_object } from "xray16";

import { IRegistryObjectState } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { registerZone, unregisterZone } from "@/engine/core/database/zones";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";

/**
 * todo;
 */
export function registerSmartTerrain(object: XR_game_object, cseObject: SmartTerrain): IRegistryObjectState {
  registry.smartTerrains.set(cseObject.id, cseObject);

  return registerZone(object);
}

/**
 * todo;
 */
export function unregisterSmartTerrain(object: XR_game_object, cseObject: SmartTerrain): void {
  unregisterZone(object);
  registry.smartTerrains.delete(cseObject.id);
}
