import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Check if object can see another object with provided story id.
 *
 * Where:
 * - storyId - story object id to check being seen by object.
 */
extern("xr_conditions.see_npc", (_: GameObject, object: GameObject, [storyId]: [TStringId]): boolean => {
  const target: Nillable<GameObject> = getObjectByStoryId(storyId);

  return target ? object.see(target) : false;
});
