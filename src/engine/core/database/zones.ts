import { XR_game_object } from "xray16";

import { IRegistryObjectState, registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";

/**
 * todo;
 */
export function registerZone(zone: XR_game_object): IRegistryObjectState {
  registry.zones.set(zone.name(), zone);

  return registerObject(zone);
}

/**
 * todo;
 */
export function unregisterZone(zone: XR_game_object): void {
  registry.zones.delete(zone.name());
  unregisterObject(zone);
}
