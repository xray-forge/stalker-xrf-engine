import { GameObject, ServerObject } from "xray16/alias";
import { extern, Nillable, TDistance, TNumberId, TStringId } from "xray16/lib";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";

/**
 * Check if actor distance to object with provided story ID is greater than provided value.
 *
 * Where:
 * - storyId - story ID of the object to check
 * - distance - number value representing distance to check.
 */
extern(
  "xr_conditions.dist_to_story_obj_ge",
  (_: GameObject, __: GameObject, [storyId, distance]: [TStringId, TDistance]): boolean => {
    const storyObjectId: Nillable<TNumberId> = getObjectIdByStoryId(storyId);

    return storyObjectId
      ? (registry.simulator.object(storyObjectId) as ServerObject).position.distance_to_sqr(registry.actor.position()) >
          distance * distance
      : true;
  }
);
