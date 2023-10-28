import type { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import type { Actor } from "@/engine/core/objects/creature/Actor";
import type { GameObject, ServerActorObject } from "@/engine/lib/types";

/**
 * Register new actor entry in db.
 * Usually means that game is loaded or started.
 *
 * @param object - game object to register as actor
 * @returns registry object state
 */
export function registerActor(object: GameObject): IRegistryObjectState {
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
  registry.actor = null as unknown as GameObject;
}

/**
 * Register new actor server entry in db.
 *
 * @param object - server object to register as actor
 * @returns registered object
 */
export function registerActorServer(object: ServerActorObject): Actor {
  registry.actorServer = object as Actor;

  return object as Actor;
}

/**
 * Unregister actor and remove entry from database.
 */
export function unregisterActorServer(): void {
  registry.actorServer = null as unknown as Actor;
}
