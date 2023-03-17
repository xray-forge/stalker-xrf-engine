import { XR_game_object } from "xray16";

import { registerObject, unregisterObject } from "@/engine/scripts/core/database/objects";
import { registry } from "@/engine/scripts/core/database/registry";

/**
 * todo;
 */
export function registerZone(zone: XR_game_object): void {
  registry.zones.set(zone.name(), zone);
  registerObject(zone);
}

/**
 * todo;
 */
export function unregisterZone(zone: XR_game_object): void {
  registry.zones.delete(zone.name());
  unregisterObject(zone);
}
