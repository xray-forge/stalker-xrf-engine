import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { getObjectCommunity } from "@/engine/core/utils/community";
import {
  areCommunitiesEnemies,
  areCommunitiesFriendly,
  isActorEnemyWithFaction,
  isActorFriendWithFaction,
  isActorNeutralWithFaction,
  isAnySquadMemberEnemyToActor,
  isAnySquadMemberFriendToActor,
} from "@/engine/core/utils/relation";
import { TCommunity } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { AnyGameObject, EGameObjectRelation, EScheme, GameObject, Optional, TStringId } from "@/engine/lib/types";

/**
 * Whether actor faction is enemy with provided parameter community.
 */
extern(
  "xr_conditions.is_factions_enemies",
  (actor: GameObject, object: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community ? areCommunitiesEnemies(getObjectCommunity(registry.actorServer), community) : false;
  }
);

/**
 * Whether actor faction is neutral with provided parameter community.
 */
extern(
  "xr_conditions.is_factions_neutrals",
  (actor: GameObject, object: GameObject, [community]: [TCommunity]): boolean => {
    if (community === null) {
      return true;
    }

    return !(
      areCommunitiesEnemies(getObjectCommunity(registry.actorServer), community) ||
      areCommunitiesFriendly(getObjectCommunity(registry.actorServer), community)
    );
  }
);

/**
 * Whether actor faction is friendly with provided parameter community.
 */
extern(
  "xr_conditions.is_factions_friends",
  (actor: GameObject, object: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community ? areCommunitiesFriendly(getObjectCommunity(registry.actorServer), community) : false;
  }
);

/**
 * Whether provided community has enemy relation to actor.
 */
extern(
  "xr_conditions.is_faction_enemy_to_actor",
  (actor: GameObject, object: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community ? isActorEnemyWithFaction(community) : false;
  }
);

/**
 * Whether provided community has friendly relation to actor.
 */
extern(
  "xr_conditions.is_faction_friend_to_actor",
  (actor: GameObject, object: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community ? isActorFriendWithFaction(community) : false;
  }
);

/**
 * Whether provided community has neutral relation to actor.
 */
extern(
  "xr_conditions.is_faction_neutral_to_actor",
  (actor: GameObject, object: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community ? isActorNeutralWithFaction(community) : false;
  }
);

/**
 * Whether squad is friendly to actor.
 */
extern(
  "xr_conditions.is_squad_friend_to_actor",
  (actor: GameObject, object: GameObject, params: Array<TStringId>): boolean => {
    for (const [, squadStoryId] of ipairs(params)) {
      const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

      if (squad && isAnySquadMemberFriendToActor(squad)) {
        return true;
      }
    }

    return false;
  }
);

/**
 * Whether any squad story id has actor enemies.
 */
extern(
  "xr_conditions.is_squad_enemy_to_actor",
  (actor: GameObject, object: GameObject, params: Array<TStringId>): boolean => {
    for (const [, squadStoryId] of ipairs(params)) {
      const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

      if (squad && isAnySquadMemberEnemyToActor(squad)) {
        return true;
      }
    }

    return false;
  }
);

/**
 * Whether object is in combat and fighting actor.
 */
extern("xr_conditions.fighting_actor", (actor: GameObject, object: GameObject): boolean => {
  return registry.objects.get(object.id()).enemyId === ACTOR_ID;
});

/**
 * Whether object has enemy relations with actor.
 */
extern("xr_conditions.actor_enemy", (actor: GameObject, object: GameObject): boolean => {
  const state: Optional<ISchemeDeathState> = registry.objects.get(object.id())[EScheme.DEATH] as ISchemeDeathState;

  return object.relation(actor) === EGameObjectRelation.ENEMY || state?.killerId === ACTOR_ID;
});

/**
 * Whether object has friendly relations with actor.
 */
extern("xr_conditions.actor_friend", (actor: GameObject, object: GameObject): boolean => {
  return object.relation(actor) === EGameObjectRelation.FRIEND;
});

/**
 * Whether object has neutral relations with actor.
 */
extern("xr_conditions.actor_neutral", (actor: GameObject, object: GameObject): boolean => {
  return object.relation(actor) === EGameObjectRelation.NEUTRAL;
});

/**
 * Whether object community matches provided parameter.
 */
extern(
  "xr_conditions.npc_community",
  (actor: GameObject, object: AnyGameObject, [community]: [Optional<TCommunity>]): boolean => {
    if (!community) {
      abort("Wrong parameters in 'npc_community' condition.");
    }

    return getObjectCommunity(object) === community;
  }
);
