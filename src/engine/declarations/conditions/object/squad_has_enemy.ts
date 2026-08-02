import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TStringId } from "xray16/lib";

import { getServerObjectByStoryId } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad";

/**
 * Check whether any squad member has any enemy.
 *
 * Params:
 * - storyId - story ID of the squad to check.
 */
extern("xr_conditions.squad_has_enemy", (_: GameObject, __: GameObject, [storyId]: [Nillable<TStringId>]): boolean => {
  if (!storyId) {
    abort("Incorrect params in 'squad_has_enemy' condition: storyId '%s'.", storyId);
  }

  const squad: Nillable<Squad> = getServerObjectByStoryId(storyId);

  if (squad) {
    for (const squadMember of squad.squad_members()) {
      // todo: Check from registry?
      const squadObject: Nillable<GameObject> = level.object_by_id(squadMember.object.id);

      if (!squadObject) {
        return false;
      } else if (squadObject.best_enemy()) {
        return true;
      }
    }
  }

  return false;
});
