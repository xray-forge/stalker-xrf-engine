import { GameObject, ServerObject } from "xray16/alias";
import { extern, Nillable, TDistance, TNumberId } from "xray16/lib";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";

/**
 * Check if distance between actor and object with provided story id is less than distance parameter.
 *
 * Where:
 * - storyId - story ID of object to check
 * - distance - number value representing distance to check.
 */
extern(
  "xr_conditions.distance_to_obj_le",
  (_: GameObject, __: GameObject, [storyId, distance]: [string, TDistance]): boolean => {
    const objectId: Nillable<TNumberId> = getObjectIdByStoryId(storyId);
    const targetObject: Nillable<ServerObject> = objectId ? registry.simulator.object(objectId) : null;

    return targetObject
      ? registry.actor.position().distance_to_sqr(targetObject.position) < distance * distance
      : false;
  }
);
