import { GameObject, ServerObject } from "xray16/alias";
import { extern, Nillable, TNumberId, TStringId } from "xray16/lib";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { isStalker } from "@/engine/core/utils/class_ids";

/**
 * Check if at least one story IDs object is alive and is stalker.
 *
 * Notes:
 * - Returns false if provided story IDs list is empty
 * - Returns true only if at least one object is alive stalker.
 *
 * Where:
 * - parameters - variadic list of story IDs.
 */
extern("xr_conditions.is_alive_one", (_: GameObject, __: GameObject, parameters: Array<TStringId>): boolean => {
  for (const [, storyId] of ipairs(parameters)) {
    const objectId: Nillable<TNumberId> = getObjectIdByStoryId(storyId);

    if (objectId) {
      const object: Nillable<ServerObject> = registry.simulator.object(objectId);

      if (object && isStalker(object) && object.alive()) {
        return true;
      }
    } else {
      return false;
    }
  }

  return false;
});
