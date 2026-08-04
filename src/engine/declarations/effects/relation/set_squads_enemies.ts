import { EGameObjectRelation, GameObject } from "xray16/alias";
import { abort, extern, Nillable, TStringId } from "xray16/lib";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";

/**
 * Set two provided squads as enemies one to another.
 */
extern(
  "xr_effects.set_squads_enemies",
  (_: GameObject, __: GameObject, [firstStoryId, secondStoryId]: [TStringId, TStringId]): void => {
    if (!firstStoryId || !secondStoryId) {
      abort("Wrong parameters in effect set_squad_enemies.");
    }

    const firstSquad: Nillable<Squad> = getServerObjectByStoryId(firstStoryId);
    const secondSquad: Nillable<Squad> = getServerObjectByStoryId(secondStoryId);

    if (!firstSquad) {
      abort("There is no squad with story id '%s'.", firstStoryId);
    } else if (!secondSquad) {
      abort("There is no squad with story id '%s'.", secondStoryId);
    }

    for (const squadMemberDescriptor of firstSquad.squad_members()) {
      const member: Nillable<GameObject> = registry.objects.get(squadMemberDescriptor.id)
        ?.object as Nillable<GameObject>;

      if (member) {
        for (const anotherSquadMemberDescriptor of secondSquad.squad_members()) {
          const anotherMember: Nillable<GameObject> = registry.objects.get(anotherSquadMemberDescriptor.id)
            ?.object as Nillable<GameObject>;

          if (anotherMember) {
            member.set_relation(EGameObjectRelation.ENEMY, anotherMember);
            anotherMember.set_relation(EGameObjectRelation.ENEMY, member);
          }
        }
      }
    }
  }
);
