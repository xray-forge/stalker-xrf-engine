import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { registerZone, unregisterZone } from "@/engine/core/database/zones";
import { SmartCover } from "@/engine/core/objects/server/smart_cover";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { isEmpty } from "@/engine/core/utils/table";
import { ClientObject, Optional, TName, TNumberId, ZoneCampfire } from "@/engine/lib/types";

/**
 * Register smart terrain object.
 *
 * @param object - smart terrain client game object
 * @param smartTerrain - smart terrain server game object
 * @returns object state representation in registry
 */
export function registerSmartTerrain(object: ClientObject, smartTerrain: SmartTerrain): IRegistryObjectState {
  registry.smartTerrains.set(smartTerrain.id, smartTerrain);

  return registerZone(object);
}

/**
 * Unregister smart terrain object.
 *
 * @param object - smart terrain client game object
 * @param smartTerrain - smart terrain server game object
 */
export function unregisterSmartTerrain(object: ClientObject, smartTerrain: SmartTerrain): void {
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

/**
 * Register smart terrain campfire object.
 *
 * @param smartTerrain - smart terrain object to register for
 * @param object - game object to register as campfire
 */
export function registerSmartTerrainCampfire(smartTerrain: SmartTerrain, object: ClientObject): void {
  const smartTerrainName: TName = smartTerrain.name();
  const campfire: ZoneCampfire = object.get_campfire();

  campfire.turn_off();

  if (registry.smartTerrainsCampfires.get(smartTerrainName) === null) {
    registry.smartTerrainsCampfires.set(smartTerrainName, new LuaTable());
  }

  registry.smartTerrainsCampfires.get(smartTerrainName).set(object.id(), campfire);

  registerObject(object);
}

/**
 * Unregister smart terrain campfire object.
 *
 * @param smartTerrain - smart terrain object to unregister for
 * @param object - game object to unregister as campfire
 */
export function unRegisterSmartTerrainCampfire(smartTerrain: SmartTerrain, object: ClientObject): void {
  const smartTerrainName: TName = smartTerrain.name();
  const smartTerrainList: Optional<LuaTable<TNumberId, ZoneCampfire>> =
    registry.smartTerrainsCampfires.get(smartTerrainName);

  if (smartTerrainList !== null) {
    smartTerrainList.delete(object.id());

    if (isEmpty(smartTerrainList)) {
      registry.smartTerrainsCampfires.delete(smartTerrainName);
    }
  }

  unregisterObject(object);
}
