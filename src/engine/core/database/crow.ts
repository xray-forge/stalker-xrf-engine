import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { GameObject, TNumberId } from "@/engine/lib/types";

/**
 * Register crow game object in lua in-memory registry.
 *
 * @param object - client game object to register
 * @returns registry object for provided game object
 */
export function registerCrow(object: GameObject): IRegistryObjectState {
  const objectId: TNumberId = object.id();

  registry.crows.storage.set(objectId, objectId);
  registry.crows.count += 1;

  return registerObject(object);
}

/**
 * Unregister crow game object from lua in-memory registry.
 *
 * @param object - client game object to unregister
 */
export function unregisterCrow(object: GameObject): void {
  const objectId: TNumberId = object.id();

  if (registry.crows.storage.has(objectId)) {
    registry.crows.count -= 1;
  }

  registry.crows.storage.delete(objectId);

  unregisterObject(object);
}
