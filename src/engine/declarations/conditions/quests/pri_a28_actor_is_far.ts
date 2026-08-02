import { GameObject } from "xray16/alias";
import { abort, extern, Nillable } from "xray16/lib";

import { storyIds } from "@/engine/constants/story_ids";
import { getServerObjectByStoryId } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";

/**
 * Check if actor is far from military squad.
 */
extern("xr_conditions.pri_a28_actor_is_far", (actor: GameObject, object: GameObject): boolean => {
  const squad: Nillable<Squad> = getServerObjectByStoryId(storyIds.pri_a16_military_squad)!;

  if (!squad) {
    abort("Unexpected actor distance check - no squad existing.");
  }

  for (const squadMember of squad.squad_members()) {
    if (squadMember.object.position.distance_to_sqr(actor.position()) < 150 * 150) {
      return false;
    }
  }

  return true;
});
