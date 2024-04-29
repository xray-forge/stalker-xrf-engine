import { registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import { AnyGameObject, GameObject, Optional, ServerCreatureObject, TNumberId } from "@/engine/lib/types";

/**
 * Get squad of provided object.
 *
 * @param object - server or game object
 * @return object squad server object or null
 */
export function getObjectSquad(object: AnyGameObject): Optional<Squad> {
  // Get for game object.
  if (type(object.id) === "function") {
    const serverObject: Optional<ServerCreatureObject> = registry.simulator.object((object as GameObject).id());

    return !serverObject || serverObject.group_id === MAX_ALIFE_ID
      ? null
      : registry.simulator.object<Squad>(serverObject.group_id);
  } else {
    // Get for server object.
    return (object as ServerCreatureObject).group_id === MAX_ALIFE_ID
      ? null
      : registry.simulator.object<Squad>((object as ServerCreatureObject).group_id);
  }
}

/**
 * Get squad of provided object.
 *
 * @param objectId - object id to check
 * @return object squad server object or null
 */
export function getObjectSquadByObjectId(objectId: TNumberId): Optional<Squad> {
  const serverObject: Optional<ServerCreatureObject> = registry.simulator.object(objectId);

  return !serverObject || serverObject.group_id === MAX_ALIFE_ID
    ? null
    : registry.simulator.object<Squad>(serverObject.group_id);
}
