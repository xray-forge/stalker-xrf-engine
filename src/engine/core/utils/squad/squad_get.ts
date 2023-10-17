import { registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/server/squad";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { AnyGameObject, GameObject, Optional, ServerCreatureObject } from "@/engine/lib/types";

/**
 * Get squad of provided object.
 *
 * @param object - server or client object
 * @return object squad server object or null
 */
export function getObjectSquad(object: AnyGameObject): Optional<Squad> {
  // Get for client object.
  if (type(object.id) === "function") {
    const serverObject: Optional<ServerCreatureObject> = registry.simulator.object((object as GameObject).id());

    return !serverObject || serverObject.group_id === MAX_U16
      ? null
      : registry.simulator.object<Squad>(serverObject.group_id);
  } else {
    // Get for server object.
    return (object as ServerCreatureObject).group_id === MAX_U16
      ? null
      : registry.simulator.object<Squad>((object as ServerCreatureObject).group_id);
  }
}
