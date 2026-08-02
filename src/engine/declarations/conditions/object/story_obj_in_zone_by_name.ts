import { GameObject } from "xray16/alias";
import { extern, Nillable, TName, TNumberId, TStringId } from "xray16/lib";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";

/**
 * Check if story ID object is in zone with provided name.
 *
 * Where:
 * - storyId - story ID of object to check
 * - zoneName - name of zone object to check object in.
 */
extern(
  "xr_conditions.story_obj_in_zone_by_name",
  (_: GameObject, __: GameObject, [storyId, zoneName]: [TStringId, TName]): boolean => {
    const objectId: Nillable<TNumberId> = getObjectIdByStoryId(storyId);
    const zone: Nillable<GameObject> = registry.zones.get(zoneName);

    if (objectId && zone) {
      return zone.inside(registry.simulator.object(objectId)!.position);
    }

    return false;
  }
);
