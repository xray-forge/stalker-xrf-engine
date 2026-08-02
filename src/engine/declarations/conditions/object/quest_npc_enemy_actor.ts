import { GameObject } from "xray16/alias";
import { abort, extern, Nillable } from "xray16/lib";

import { getObjectByStoryId, registry } from "@/engine/core/database";
import { isStalker } from "@/engine/core/utils/class_ids";

/**
 * Check whether the stalker identified by story id is hostile to the actor.
 *
 * @param _ - Actor game object, not used.
 * @param __ - Target game object, not used.
 * @param p - Tuple with the story id of the stalker to check.
 * @returns Whether the stalker exists and its goodwill towards the actor is at or below the hostile threshold.
 */
extern("xr_conditions.quest_npc_enemy_actor", (_: GameObject, __: GameObject, p: [string]): boolean => {
  if (!p[0]) {
    abort("wrong story id");
  }

  const object: Nillable<GameObject> = getObjectByStoryId(p[0]);

  if (object && isStalker(object)) {
    const actor: Nillable<GameObject> = registry.actor;

    if (actor && object.general_goodwill(actor) <= -1000) {
      return true;
    }
  }

  return false;
});
