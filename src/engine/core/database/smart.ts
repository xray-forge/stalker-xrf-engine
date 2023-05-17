import { XR_game_object } from "xray16";

import { IRegistryObjectState } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { registerZone, unregisterZone } from "@/engine/core/database/zones";
import { SmartCover } from "@/engine/core/objects";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";

/**
 * Register smart terrain object.
 */
export function registerSmartTerrain(object: XR_game_object, smartTerrain: SmartTerrain): IRegistryObjectState {
  registry.smartTerrains.set(smartTerrain.id, smartTerrain);

  return registerZone(object);
}

/**
 * Unregister smart terrain object.
 */
export function unregisterSmartTerrain(object: XR_game_object, smartTerrain: SmartTerrain): void {
  unregisterZone(object);
  registry.smartTerrains.delete(smartTerrain.id);
}

/**
 * Register smart cover object.
 */
export function registerSmartCover(smartCover: SmartCover): void {
  registry.smartCovers.set(smartCover.name(), smartCover);
}

/**
 * Unregister smart cover object.
 */
export function unregisterSmartCover(smartCover: SmartCover): void {
  registry.smartCovers.delete(smartCover.name());
}
