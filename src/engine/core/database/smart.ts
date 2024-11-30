import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { registerZone, unregisterZone } from "@/engine/core/database/zones";
import { SmartCover } from "@/engine/core/objects/smart_cover";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { isEmpty } from "@/engine/core/utils/table";
import { GameObject, Optional, TName, TNumberId, ZoneCampfire } from "@/engine/lib/types";

/**
 * Register smart terrain object.
 *
 * @param object - smart terrain client game object
 * @param terrain - smart terrain server game object
 * @returns object state representation in registry
 */
export function registerSmartTerrain(object: GameObject, terrain: SmartTerrain): IRegistryObjectState {
  registry.smartTerrains.set(terrain.id, terrain);

  return registerZone(object);
}

/**
 * Unregister smart terrain object.
 *
 * @param object - smart terrain client game object
 * @param terrain - smart terrain server game object
 */
export function unregisterSmartTerrain(object: GameObject, terrain: SmartTerrain): void {
  unregisterZone(object);
  registry.smartTerrains.delete(terrain.id);
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

/**
 * Register smart terrain campfire object.
 *
 * @param terrain - smart terrain object to register for
 * @param object - game object to register as campfire
 */
export function registerSmartTerrainCampfire(terrain: SmartTerrain, object: GameObject): void {
  const terrainName: TName = terrain.name();
  const campfire: ZoneCampfire = object.get_campfire();

  campfire.turn_off();

  if (registry.smartTerrainsCampfires.get(terrainName) === null) {
    registry.smartTerrainsCampfires.set(terrainName, new LuaTable());
  }

  registry.smartTerrainsCampfires.get(terrainName).set(object.id(), campfire);

  registerObject(object);
}

/**
 * Unregister smart terrain campfire object.
 *
 * @param terrain - smart terrain object to unregister for
 * @param object - game object to unregister as campfire
 */
export function unRegisterSmartTerrainCampfire(terrain: SmartTerrain, object: GameObject): void {
  const terrainName: TName = terrain.name();
  const terrainList: Optional<LuaTable<TNumberId, ZoneCampfire>> = registry.smartTerrainsCampfires.get(terrainName);

  if (terrainList !== null) {
    terrainList.delete(object.id());

    if (isEmpty(terrainList)) {
      registry.smartTerrainsCampfires.delete(terrainName);
    }
  }

  unregisterObject(object);
}
