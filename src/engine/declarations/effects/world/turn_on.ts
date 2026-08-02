import { GameObject } from "xray16/alias";
import { assert, extern, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Turn on hanging lamp objects by story IDs.
 */
extern("xr_effects.turn_on", (_: GameObject, __: GameObject, parameters: Array<TStringId>) => {
  for (const storyId of parameters) {
    const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

    assert(storyObject, "Object with story id '%s' does not exist.", storyId);

    storyObject.get_hanging_lamp().turn_on();
  }
});
