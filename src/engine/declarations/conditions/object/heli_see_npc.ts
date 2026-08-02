import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Check if helicopter object sees object with provided story ID.
 *
 * Where:
 * - storyId - story ID of the object to check visibility by helicopter object.
 */
extern("xr_conditions.heli_see_npc", (_: GameObject, object: GameObject, [storyId]: [Nillable<TStringId>]): boolean => {
  if (storyId) {
    const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

    return storyObject ? object.get_helicopter().isVisible(storyObject) : false;
  }

  return false;
});
