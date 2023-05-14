import { XR_game_object } from "xray16";

import { IRegistryObjectState, registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";

/**
 * Register zone object.
 */
export function registerZone(zone: XR_game_object): IRegistryObjectState {
  registry.zones.set(zone.name(), zone);

  return registerObject(zone);
}

/**
 * Unregister zone object.
 */
export function unregisterZone(zone: XR_game_object): void {
  registry.zones.delete(zone.name());
  unregisterObject(zone);
}
