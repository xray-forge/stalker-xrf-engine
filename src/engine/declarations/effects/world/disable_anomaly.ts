import { GameObject } from "xray16/alias";
import { abort, assert, extern, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Disable anomaly by story ID.
 *
 * Where:
 * - storyId - story ID of anomaly object to disable.
 */
extern("xr_effects.disable_anomaly", (_: GameObject, __: GameObject, [storyId]: [TStringId]): void => {
  assert(storyId, "Story id for 'disable_anomaly' effect is not provided.");

  const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

  if (storyObject) {
    storyObject.disable_anomaly();
  } else {
    abort("There is no anomaly with story id '%s'.", storyId);
  }
});
