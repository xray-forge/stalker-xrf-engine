import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { assert, extern, Nillable, TStringId } from "xray16/lib";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import { type Squad } from "@/engine/core/objects/squad";

/**
 * Find all online objects of squad and make actor visible for them.
 * Expects squad story ID as parameter.
 */
extern("xr_effects.make_actor_visible_to_squad", (actor: GameObject, __: GameObject, [storyId]: [TStringId]): void => {
  const squad: Nillable<Squad> = getServerObjectByStoryId(storyId);

  assert(squad, "There is no squad with story id - '%s'.", storyId);

  for (const squadMember of squad.squad_members()) {
    const gameObject: Nillable<GameObject> = (registry.objects.get(squadMember.id)?.object ??
      level.object_by_id(squadMember.id)) as Nillable<GameObject>;

    if (gameObject) {
      gameObject.make_object_visible_somewhen(actor);
    }
  }
});
