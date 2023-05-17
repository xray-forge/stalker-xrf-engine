import { XR_game_object } from "xray16";

import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { IRegistryObjectState } from "@/engine/core/database/types";

/**
 * Register zone object.
 *
 * @param object - zone game object to register
 * @returns registry state for provided object
 */
export function registerZone(object: XR_game_object): IRegistryObjectState {
  registry.zones.set(object.name(), object);

  return registerObject(object);
}

/**
 * Unregister zone object.
 *
 * @param object - zone game object to unregister
 */
export function unregisterZone(object: XR_game_object): void {
  registry.zones.delete(object.name());
  unregisterObject(object);
}
