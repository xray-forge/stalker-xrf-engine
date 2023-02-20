import { XR_game_object } from "xray16";

import { ISmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { registry } from "@/mod/scripts/core/db/registry";
import { addZone, deleteZone } from "@/mod/scripts/core/db/zones";

/**
 * todo;
 */
export function addSmartTerrain(object: XR_game_object, cseObject: ISmartTerrain): void {
  addZone(object);
  registry.smartTerrains.set(cseObject.id, cseObject);
}

/**
 * todo;
 */
export function deleteSmartTerrain(object: XR_game_object, cseObject: ISmartTerrain): void {
  deleteZone(object);
  registry.smartTerrains.delete(cseObject.id);
}
