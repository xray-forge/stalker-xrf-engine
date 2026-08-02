import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Kill the linked object or the object referenced by the provided story ID if it is alive.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object to kill when no story ID is provided.
 * @param storyId - Nillable story ID of the object to kill instead of the linked object.
 */
extern("xr_effects.kill_npc", (_: GameObject, object: Nillable<GameObject>, [storyId]: [Nillable<TStringId>]): void => {
  if (storyId) {
    object = getObjectByStoryId(storyId);
  }

  if (object?.alive()) {
    object.kill(object);
  }
});
