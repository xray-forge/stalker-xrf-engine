import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { getObjectByStoryId, registry } from "@/engine/core/database";

/**
 * Check if object with story ID exists.
 */
extern("xr_conditions.jup_b47_npc_online", (_: GameObject, __: GameObject, [storyId]: [TStringId]): boolean => {
  const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

  if (storyObject) {
    return $isNotNil(registry.simulator.object(storyObject.id()));
  } else {
    return false;
  }
});
