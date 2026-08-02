import { AlifeSimulator, GameObject, ServerObject } from "xray16/alias";
import { extern, Nillable, TNumberId, TStringId } from "xray16/lib";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { isStalker } from "@/engine/core/utils/class_ids";

/**
 * Check if all story IDs objects are alive.
 * Ensures all story ID objects are stalkers and alive.
 *
 * Notes:
 * - Returns true if provided story IDs list is empty
 * - Returns false if object with provided story ID is not found
 * - Returns false if provided story ID object is not stalker.
 *
 * Where:
 * - parameters - variadic list of story IDs.
 */
extern("xr_conditions.is_alive_all", (_: GameObject, __: GameObject, parameters: Array<TStringId>): boolean => {
  const simulator: AlifeSimulator = registry.simulator;

  for (const [, storyId] of ipairs(parameters)) {
    const objectId: Nillable<TNumberId> = getObjectIdByStoryId(storyId);

    if (objectId) {
      const serverObject: Nillable<ServerObject> = simulator.object(objectId);

      if (serverObject && (!isStalker(serverObject) || !serverObject.alive())) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
});
