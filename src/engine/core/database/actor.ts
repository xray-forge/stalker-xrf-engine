import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { IRegistryObjectState } from "@/engine/core/database/types";
import { ClientObject } from "@/engine/lib/types";

/**
 * Register new actor entry in db.
 * Usually means that game is loaded or started.
 *
 * @param object - game object to register as actor
 * @returns registry object state
 */
export function registerActor(object: ClientObject): IRegistryObjectState {
  registry.actor = object;

  return registerObject(object);
}

/**
 * Unregister actor and remove entry from database.
 * Part of actor lifecycle and in most cases when game code is execute actor is available,
 * so it is primary reason why actor is not marked as Optional in db.
 */
export function unregisterActor(): void {
  unregisterObject(registry.actor);
  registry.actor = null as unknown as ClientObject;
}
