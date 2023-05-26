import { game_object } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { IRegistryObjectState } from "@/engine/core/database/types";
import { registerZone, unregisterZone } from "@/engine/core/database/zones";
import { SmartCover } from "@/engine/core/objects";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";

/**
 * Register smart terrain object.
 *
 * @param object - smart terrain client game object
 * @param smartTerrain - smart terrain server game object
 * @returns object state representation in registry
 */
export function registerSmartTerrain(object: game_object, smartTerrain: SmartTerrain): IRegistryObjectState {
  registry.smartTerrains.set(smartTerrain.id, smartTerrain);

  return registerZone(object);
}

/**
 * Unregister smart terrain object.
 *
 * @param object - smart terrain client game object
 * @param smartTerrain - smart terrain server game object
 */
export function unregisterSmartTerrain(object: game_object, smartTerrain: SmartTerrain): void {
  unregisterZone(object);
  registry.smartTerrains.delete(smartTerrain.id);
}

/**
 * Register smart cover object.
 *
 * @param smartCover - smart cover server game object
 */
export function registerSmartCover(smartCover: SmartCover): void {
  registry.smartCovers.set(smartCover.name(), smartCover);
}

/**
 * Unregister smart cover object.
 *
 * @param smartCover - smart cover server game object
 */
export function unregisterSmartCover(smartCover: SmartCover): void {
  registry.smartCovers.delete(smartCover.name());
}
