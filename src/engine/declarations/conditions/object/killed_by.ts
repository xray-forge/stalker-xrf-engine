import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId, registry } from "@/engine/core/database";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { getSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Check if object was killed by one of provided story IDs.
 *
 * Where:
 * - parameters - variadic list of story IDs to check.
 */
extern("xr_conditions.killed_by", (_: GameObject, object: GameObject, parameters: Array<TStringId>): boolean => {
  const state: Nillable<ISchemeDeathState> = getSchemeState(registry.objects.get(object.id()), EScheme.DEATH);

  if (!state) {
    return false;
  }

  for (const [, storyId] of ipairs(parameters)) {
    const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

    // todo: Probably getting story link is enough.
    if (storyObject && state.killerId === storyObject.id()) {
      return true;
    }
  }

  return false;
});
