import { EGameObjectRelation, GameObject } from "xray16/alias";
import { Nillable, TCount, TStringId } from "xray16/lib";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import {
  EGoodwill,
  ERelation,
  increaseCommunityGoodwillToId,
  setObjectSympathy,
  setSquadRelationToActor,
  setSquadRelationWithObject,
  updateSquadIdRelationToActor,
} from "@/engine/core/utils/relation";
import { TCommunity } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";

/**
 * Set object goodwill as friendly to actor.
 */
extern("xr_effects.actor_friend", (actor: GameObject, object: GameObject): void => {
  object.force_set_goodwill(EGoodwill.FRIENDS, actor);
});

/**
 * Set object goodwill as neutral to actor.
 */
extern("xr_effects.actor_neutral", (actor: GameObject, object: GameObject): void => {
  object.force_set_goodwill(EGoodwill.NEUTRALS, actor);
});

/**
 * Set object goodwill as enemy to actor.
 */
extern("xr_effects.actor_enemy", (actor: GameObject, object: GameObject): void => {
  object.force_set_goodwill(EGoodwill.ENEMIES, actor);
});

/**
 * Set squad relation to actor as neutral by story ID.
 */
extern("xr_effects.set_squad_neutral_to_actor", (_: GameObject, __: GameObject, [squadStoryId]: [TStringId]): void => {
  const squad: Nillable<Squad> = getServerObjectByStoryId(squadStoryId);

  if (squad) {
    setSquadRelationToActor(squad, ERelation.NEUTRAL);
  }
});

/**
 * Set squad relation to actor as friendly by story ID.
 */
extern("xr_effects.set_squad_friend_to_actor", (_: GameObject, __: GameObject, [squadStoryId]: [TStringId]): void => {
  const squad: Nillable<Squad> = getServerObjectByStoryId(squadStoryId);

  if (squad) {
    setSquadRelationToActor(squad, ERelation.FRIEND);
  }
});

/**
 * Set squad relation to actor as enemy by story ID.
 */
extern("xr_effects.set_squad_enemy_to_actor", (_: GameObject, __: GameObject, [squadStoryId]: [TStringId]): void => {
  const squad: Nillable<Squad> = getServerObjectByStoryId(squadStoryId);

  if (squad) {
    setSquadRelationToActor(squad, ERelation.ENEMY);
  }
});

/**
 * Set object sympathy level based on provided `sympathy` parameter.
 */
extern("xr_effects.set_npc_sympathy", (_: GameObject, object: GameObject, [sympathy]: [Nillable<TCount>]): void => {
  if (sympathy) {
    setObjectSympathy(object, sympathy);
  }
});

/**
 * Set squad relation to an actor.
 */
extern(
  "xr_effects.set_squad_goodwill",
  (_: GameObject, __: GameObject, [storyId, relation]: [Nillable<TStringId>, Nillable<ERelation>]): void => {
    if (storyId && relation) {
      updateSquadIdRelationToActor(storyId, relation);
    }
  }
);

/**
 * Set squad relation to an object.
 */
extern(
  "xr_effects.set_squad_goodwill_to_npc",
  (_: GameObject, object: GameObject, [storyId, relation]: [Nillable<TStringId>, Nillable<ERelation>]): void => {
    if (storyId && relation) {
      setSquadRelationWithObject(storyId, object, relation);
    }
  }
);

/**
 * Increment relation value by `count` for provided community.
 */
extern(
  "xr_effects.inc_faction_goodwill_to_actor",
  (_: GameObject, __: GameObject, [community, delta]: [Nillable<TCommunity>, Nillable<TCount>]): void => {
    if (!delta || !community) {
      abort("Wrong parameters in effect 'inc_faction_goodwill_to_actor'.");
    }

    increaseCommunityGoodwillToId(community, ACTOR_ID, tonumber(delta) as TCount);
  }
);

/**
 * Decrement relation value by `count` for provided community.
 */
extern(
  "xr_effects.dec_faction_goodwill_to_actor",
  (_: GameObject, __: GameObject, [community, delta]: [Nillable<TCommunity>, Nillable<TCount>]): void => {
    if (!delta || !community) {
      abort("Wrong parameters in effect 'dec_faction_goodwill_to_actor'.");
    }

    increaseCommunityGoodwillToId(community, ACTOR_ID, -(tonumber(delta) as TCount));
  }
);

/**
 * Set two provided squads as enemies one to another.
 */
extern(
  "xr_effects.set_squads_enemies",
  (_: GameObject, __: GameObject, [firstStoryId, secondStoryId]: [TStringId, TStringId]) => {
    if (!firstStoryId || !secondStoryId) {
      return abort("Wrong parameters in effect set_squad_enemies.");
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
