import { XR_game_object } from "xray16";

import { addObject, deleteObject } from "@/mod/scripts/core/database/objects";
import { registry } from "@/mod/scripts/core/database/registry";

/**
 * todo;
 */
export function addZone(zone: XR_game_object): void {
  registry.zones.set(zone.name(), zone);
  addObject(zone);
}

/**
 * todo;
 */
export function deleteZone(zone: XR_game_object): void {
  registry.zones.delete(zone.name());
  deleteObject(zone);
}
