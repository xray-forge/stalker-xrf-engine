import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TRate, TStringId } from "xray16/lib";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad";

/**
 * Restore health of every online member of the squad referenced by the provided story ID.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param storyId - Story ID of the squad to heal.
 * @param healthModRaw - Nillable health percentage applied to each squad member, defaults to full health.
 */
extern(
  "xr_effects.heal_squad",
  (_: GameObject, __: GameObject, [storyId, healthModRaw]: [TStringId, Nillable<number>]): void => {
    let healthMod: TRate = 1;

    if (healthModRaw) {
      healthMod = math.ceil(healthModRaw / 100);
    }

    if (!storyId) {
      abort("Wrong squad identifier 'nil' in heal_squad effect");
    }

    const squad: Nillable<Squad> = getServerObjectByStoryId(storyId);

    if (!squad) {
      return;
    }

    for (const squadMember of squad.squad_members()) {
      const gameObject: Nillable<GameObject> = registry.objects.get(squadMember.id)?.object as Nillable<GameObject>;

      if (gameObject) {
        gameObject.health = healthMod;
      }
    }
  }
);
