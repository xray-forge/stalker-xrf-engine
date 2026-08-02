import { AlifeSimulator, GameObject } from "xray16/alias";
import { extern, Nillable, TNumberId, TStringId } from "xray16/lib";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";

/**
 * Check if at least one of provided story ID objects is inside zone object.
 *
 * Where:
 * - params - variadic list of story IDs to check presence in current zone object.
 */
extern("xr_conditions.obj_in_zone", (_: GameObject, object: GameObject, params: Array<TStringId>): boolean => {
  const simulator: AlifeSimulator = registry.simulator;

  for (const [, storyId] of ipairs(params)) {
    const objectId: Nillable<TNumberId> = getObjectIdByStoryId(storyId);

    if (objectId && object.inside(simulator.object(objectId)!.position)) {
      return true;
    }
  }

  return false;
});
