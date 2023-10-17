import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/server/squad";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
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
import { EGameObjectRelation, GameObject, Optional, TCount, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
extern(
  "xr_effects.set_squad_neutral_to_actor",
  (actor: GameObject, object: GameObject, [squadStoryId]: [TStringId]): void => {
    const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

    if (squad === null) {
      return;
    } else {
      setSquadRelationToActor(squad, ERelation.NEUTRAL);
    }
  }
);

/**
 * Set squad relation to actor as friendly by story ID.
 */
extern(
  "xr_effects.set_squad_friend_to_actor",
  (actor: GameObject, object: GameObject, [squadStoryId]: [TStringId]): void => {
    const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

    if (squad === null) {
      return;
    } else {
      setSquadRelationToActor(squad, ERelation.FRIEND);
    }
  }
);

/**
 * Set squad relation to actor as enemy by story ID.
 */
extern(
  "xr_effects.set_squad_enemy_to_actor",
  (actor: GameObject, object: GameObject, [squadStoryId]: [TStringId]): void => {
    const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

    if (squad === null) {
      return;
    } else {
      setSquadRelationToActor(squad, ERelation.ENEMY);
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.set_npc_sympathy", (actor: GameObject, object: GameObject, [sympathy]: [Optional<TCount>]): void => {
  if (sympathy !== null) {
    setObjectSympathy(object, sympathy);
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.set_squad_goodwill",
  (actor: GameObject, object: GameObject, [storyId, relation]: [Optional<TStringId>, Optional<ERelation>]): void => {
    if (storyId !== null && relation !== null) {
      updateSquadIdRelationToActor(storyId, relation);
    }
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.set_squad_goodwill_to_npc",
  (actor: GameObject, object: GameObject, [storyId, relation]: [Optional<TStringId>, Optional<ERelation>]): void => {
    if (storyId !== null && relation !== null) {
      setSquadRelationWithObject(storyId, object, relation);
    }
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.inc_faction_goodwill_to_actor",
  (actor: GameObject, object: GameObject, p: [Optional<TCommunity>, Optional<number>]): void => {
    const community: Optional<TCommunity> = p[0];
    const delta: Optional<TCount> = p[1];

    if (delta && community) {
      increaseCommunityGoodwillToId(community, actor.id(), tonumber(delta)!);
    } else {
      abort("Wrong parameters in function 'inc_faction_goodwill_to_actor'");
    }
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.dec_faction_goodwill_to_actor",
  (actor: GameObject, object: GameObject, params: [Optional<TCommunity>, Optional<TCount>]): void => {
    const community: Optional<TCommunity> = params[0];
    const delta: Optional<TCount> = params[1];

    if (delta && community) {
      increaseCommunityGoodwillToId(community, actor.id(), -tonumber(delta)!);
    } else {
      abort("Wrong parameters in function 'dec_faction_goodwill_to_actor'");
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.set_squads_enemies", (actor: GameObject, object: GameObject, p: [string, string]) => {
  if (p[0] === null || p[1] === null) {
    abort("Wrong parameters in function set_squad_enemies");

    return;
  }

  const squad1: Optional<Squad> = getServerObjectByStoryId(p[0]);
  const squad2: Optional<Squad> = getServerObjectByStoryId(p[1]);

  if (squad1 === null) {
    abort("There is no squad with id[%s]", tostring(p[0]));
  } else if (squad2 === null) {
    abort("There is no squad with id[%s]", tostring(p[1]));
  }

  for (const k of squad1.squad_members()) {
    const squadObject: Optional<GameObject> = registry.objects.get(k.id)?.object as Optional<GameObject>;

    if (squadObject !== null) {
      for (const kk of squad2.squad_members()) {
        const npcObj2: Optional<GameObject> = registry.objects.get(kk.id).object as Optional<GameObject>;

        if (npcObj2 !== null) {
          squadObject.set_relation(EGameObjectRelation.ENEMY, npcObj2);
          npcObj2.set_relation(EGameObjectRelation.ENEMY, squadObject);
        }
      }
    }
  }
});
