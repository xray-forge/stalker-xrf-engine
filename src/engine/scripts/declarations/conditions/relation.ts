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
 * Check whether actor faction is enemy with provided parameter community.
 *
 * Where:
 * - community - community name to check against current actor community
 */
extern(
  "xr_conditions.is_factions_enemies",
  (_: GameObject, __: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community ? areCommunitiesEnemies(getObjectCommunity(registry.actorServer), community) : false;
  }
);

/**
 * Check whether actor faction is neutral with provided parameter community.
 *
 * Where:
 * - community - community name to check against current actor community
 */
extern("xr_conditions.is_factions_neutrals", (_: GameObject, __: GameObject, [community]: [TCommunity]): boolean => {
  if (community === null) {
    return true;
  }

  return !(
    areCommunitiesEnemies(getObjectCommunity(registry.actorServer), community) ||
    areCommunitiesFriendly(getObjectCommunity(registry.actorServer), community)
  );
});

/**
 * Whether actor faction is friendly with provided parameter community.
 *
 * Where:
 * - community - community name to check against current actor community
 */
extern(
  "xr_conditions.is_factions_friends",
  (_: GameObject, __: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community ? areCommunitiesFriendly(getObjectCommunity(registry.actorServer), community) : false;
  }
);

/**
 * Check whether provided community has enemy relation to actor.
 *
 * Where:
 * - community - community name to check against current actor community
 */
extern(
  "xr_conditions.is_faction_enemy_to_actor",
  (_: GameObject, __: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community ? isActorEnemyWithFaction(community) : false;
  }
);

/**
 * Check whether provided community has friendly relation to actor.
 *
 * Where:
 * - community - community name to check against current actor community
 */
extern(
  "xr_conditions.is_faction_friend_to_actor",
  (_: GameObject, __: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community ? isActorFriendWithFaction(community) : false;
  }
);

/**
 * Check whether provided community has neutral relation to actor.
 *
 * Where:
 * - community - community name to check against current actor community
 */
extern(
  "xr_conditions.is_faction_neutral_to_actor",
  (actor: GameObject, object: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community ? isActorNeutralWithFaction(community) : false;
  }
);

/**
 * Check whether any of provided squads is friendly to actor.
 * Checks list of provided story IDs and expect at least one member of at least one squad to be friend.
 *
 * Where:
 * - params - variadic list of squad story IDs to check
 */
extern("xr_conditions.is_squad_friend_to_actor", (_: GameObject, __: GameObject, params: Array<TStringId>): boolean => {
  for (const [, squadStoryId] of ipairs(params)) {
    const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

    if (squad && isAnySquadMemberFriendToActor(squad)) {
      return true;
    }
  }

  return false;
});

/**
 * Check whether any of provided squads is enemy to actor.
 * Checks list of provided story IDs and expect at least one member of at least one squad to be enemy.
 *
 * Where:
 * - params - variadic list of squad story IDs to check
 */
extern("xr_conditions.is_squad_enemy_to_actor", (_: GameObject, __: GameObject, params: Array<TStringId>): boolean => {
  for (const [, squadStoryId] of ipairs(params)) {
    const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

    if (squad && isAnySquadMemberEnemyToActor(squad)) {
      return true;
    }
  }

  return false;
});

/**
 * Check whether object is in combat and fighting actor.
 */
extern("xr_conditions.fighting_actor", (_: GameObject, object: GameObject): boolean => {
  return registry.objects.get(object.id()).enemyId === ACTOR_ID;
});

/**
 * Check whether object has enemy relations with actor.
 */
extern("xr_conditions.actor_enemy", (actor: GameObject, object: GameObject): boolean => {
  const state: Optional<ISchemeDeathState> = registry.objects.get(object.id())[EScheme.DEATH] as ISchemeDeathState;

  return object.relation(actor) === EGameObjectRelation.ENEMY || state?.killerId === ACTOR_ID;
});

/**
 * Check whether object has friendly relations with actor.
 */
extern("xr_conditions.actor_friend", (actor: GameObject, object: GameObject): boolean => {
  return object.relation(actor) === EGameObjectRelation.FRIEND;
});

/**
 * Check whether object has neutral relations with actor.
 */
extern("xr_conditions.actor_neutral", (actor: GameObject, object: GameObject): boolean => {
  return object.relation(actor) === EGameObjectRelation.NEUTRAL;
});

/**
 * Check whether object community matches provided parameter.
 */
extern(
  "xr_conditions.npc_community",
  (_: GameObject, object: AnyGameObject, [community]: [Optional<TCommunity>]): boolean => {
    if (!community) {
      abort("Condition 'npc_community' requires community name as parameter.");
    }

    return getObjectCommunity(object) === community;
  }
);
