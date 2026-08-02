import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Check if object is dead or not existing by story ID.
 *
 * Where:
 * - storyId - Nillable story ID of object to check.
 */
extern("xr_conditions.is_dead", (_: GameObject, __: GameObject, [storyId]: [TStringId]): boolean => {
  const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

  return !storyObject || !storyObject.alive();
});
