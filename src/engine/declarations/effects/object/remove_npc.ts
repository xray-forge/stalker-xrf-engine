import { GameObject } from "xray16/alias";
import { extern, Nillable, TNumberId, TStringId } from "xray16/lib";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";

/**
 * Release the object referenced by the provided story ID from the simulation.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param storyId - Nillable story ID of the object to release.
 */
extern("xr_effects.remove_npc", (_: GameObject, __: GameObject, [storyId]: [Nillable<TStringId>]): void => {
  let objectId: Nillable<TNumberId> = null;

  if (storyId) {
    objectId = getObjectIdByStoryId(storyId);
  }

  if (objectId) {
    registry.simulator.release(registry.simulator.object(objectId), true);
  }
});
