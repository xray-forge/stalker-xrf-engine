import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId, registry } from "@/engine/core/database";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit";
import { getSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Check if object is hit by one of provided story ID objects.
 *
 * Where:
 * - parameters - variadic list of story IDs to check.
 */
extern("xr_conditions.hitted_by", (_: GameObject, object: GameObject, parameters: Array<TStringId>): boolean => {
  const state: Nillable<ISchemeHitState> = getSchemeState(registry.objects.get(object.id()), EScheme.HIT);

  if (!state) {
    return false;
  }

  for (const [, storyId] of ipairs(parameters)) {
    const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

    // todo: Probably taking ID by SID is enough for comparison here.
    if (storyObject && state.who === storyObject.id()) {
      return true;
    }
  }

  return false;
});
