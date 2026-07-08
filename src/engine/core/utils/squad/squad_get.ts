import { AnyGameObject, GameObject, ServerCreatureObject } from "xray16/alias";
import { MAX_ALIFE_ID, Nillable, TNumberId } from "xray16/lib";

import { registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad";

/**
 * Get squad of provided object.
 *
 * @param object - Server or game object.
 * @returns Object squad server object or null.
 */
export function getObjectSquad(object: AnyGameObject): Nillable<Squad> {
  // Get for game object.
  if (type(object.id) === "function") {
    const serverObject: Nillable<ServerCreatureObject> = registry.simulator.object((object as GameObject).id());

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
 * @param objectId - Object id to check.
 * @returns Object squad server object or null.
 */
export function getObjectSquadByObjectId(objectId: TNumberId): Nillable<Squad> {
  const serverObject: Nillable<ServerCreatureObject> = registry.simulator.object(objectId);

  return !serverObject || serverObject.group_id === MAX_ALIFE_ID
    ? null
    : registry.simulator.object<Squad>(serverObject.group_id);
}
