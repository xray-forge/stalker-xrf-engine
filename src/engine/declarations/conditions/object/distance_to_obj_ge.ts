import { GameObject, ServerObject } from "xray16/alias";
import { extern, Nillable, TDistance, TNumberId, TStringId } from "xray16/lib";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";

/**
 * Check if distance between actor and object with provided story id is greater or equal to distance.
 *
 * Where:
 * - storyId - story ID of object to check
 * - distance - number value representing distance to check.
 */
extern(
  "xr_conditions.distance_to_obj_ge",
  (_: GameObject, __: GameObject, [storyId, distance]: [TStringId, TDistance]): boolean => {
    const objectId: Nillable<TNumberId> = getObjectIdByStoryId(storyId);
    const targetObject: Nillable<ServerObject> = objectId ? registry.simulator.object(objectId) : null;

    return targetObject
      ? registry.actor.position().distance_to_sqr(targetObject.position) >= distance * distance
      : false;
  }
);
