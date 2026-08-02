import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Explode game object by story id.
 *
 * Where:
 * - storyId - story ID of object to explode.
 */
extern("xr_effects.barrel_explode", (_: GameObject, __: GameObject, [storyId]: [TStringId]) => {
  const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

  if (storyObject) {
    storyObject.explode(0);
  }
});
