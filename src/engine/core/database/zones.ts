import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { IRegistryObjectState } from "@/engine/core/database/types";
import { ClientGameObject } from "@/engine/lib/types";

/**
 * Register zone object.
 *
 * @param object - zone game object to register
 * @returns registry state for provided object
 */
export function registerZone(object: ClientGameObject): IRegistryObjectState {
  registry.zones.set(object.name(), object);

  return registerObject(object);
}

/**
 * Unregister zone object.
 *
 * @param object - zone game object to unregister
 */
export function unregisterZone(object: ClientGameObject): void {
  registry.zones.delete(object.name());
  unregisterObject(object);
}
