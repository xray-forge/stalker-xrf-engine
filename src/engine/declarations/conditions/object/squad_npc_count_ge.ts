import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TStringId } from "xray16/lib";

import { getServerObjectByStoryId } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad";

/**
 * Check whether the squad identified by story id has more members than the provided count.
 *
 * @param _ - Actor game object, not used.
 * @param __ - Target game object, not used.
 * @param p - Tuple with the squad story id and the member count threshold to compare against.
 * @returns Whether the squad member count is greater than the provided threshold.
 */
extern("xr_conditions.squad_npc_count_ge", (_: GameObject, __: GameObject, p: [string, string]): boolean => {
  const storyId: Nillable<TStringId> = p[0];

  if (!storyId) {
    abort("Wrong parameter squad_id[%s] in 'squad_npc_count_ge' function", tostring(storyId));
  }

  const squad: Nillable<Squad> = getServerObjectByStoryId(storyId) as Nillable<Squad>;

  if (squad) {
    return squad.npc_count() > tonumber(p[1])!;
  } else {
    return false;
  }
});
