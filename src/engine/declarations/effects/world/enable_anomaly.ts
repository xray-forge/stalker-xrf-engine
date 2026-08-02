import { GameObject } from "xray16/alias";
import { assert, extern, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Enable anomaly by story ID.
 *
 * Where:
 * - storyId - story ID of anomaly object to enable.
 */
extern("xr_effects.enable_anomaly", (_: GameObject, __: GameObject, [storyId]: [Nillable<TStringId>]) => {
  assert(storyId, "Story id for 'enable_anomaly' effect is not provided.");

  const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

  assert(storyObject, "There is no anomaly with story id '%s'.", storyId);

  storyObject.enable_anomaly();
});
