import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { LuaLogger } from "@/engine/core/utils/logging";
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
import {
  AnyGameObject,
  EGameObjectRelation,
  EScheme,
  GameObject,
  Optional,
  ServerObject,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check whether actor faction is enemy with provided parameter community.
 */
extern(
  "xr_conditions.is_factions_enemies",
  (actor: GameObject, object: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community === null ? false : areCommunitiesEnemies(getObjectCommunity(actor), community);
  }
);

/**
 * Check whether actor faction is neutral with provided parameter community.
 */
extern(
  "xr_conditions.is_factions_neutrals",
  (actor: GameObject, object: GameObject, [community]: [TCommunity]): boolean => {
    if (community === null) {
      return true;
    }

    return !(
      areCommunitiesEnemies(getObjectCommunity(actor), community) ||
      areCommunitiesFriendly(getObjectCommunity(actor), community)
    );
  }
);

/**
 * Check whether actor faction is friendly with provided parameter community.
 */
extern(
  "xr_conditions.is_factions_friends",
  (actor: GameObject, object: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community === null ? false : areCommunitiesFriendly(getObjectCommunity(actor), community);
  }
);

/**
 * Check whether provided community has enemy relation to actor.
 */
extern(
  "xr_conditions.is_faction_enemy_to_actor",
  (actor: GameObject, object: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community === null ? false : isActorEnemyWithFaction(community);
  }
);

/**
 * Check whether provided community has friendly relation to actor.
 */
extern(
  "xr_conditions.is_faction_friend_to_actor",
  (actor: GameObject, object: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community === null ? false : isActorFriendWithFaction(community);
  }
);

/**
 * Check whether provided community has neutral relation to actor.
 */
extern(
  "xr_conditions.is_faction_neutral_to_actor",
  (actor: GameObject, object: GameObject, [community]: [Optional<TCommunity>]): boolean => {
    return community === null ? false : isActorNeutralWithFaction(community);
  }
);

/**
 * Check whether squad is friendly to actor.
 *
 * @param squadStoryId - target squad story id
 */
extern(
  "xr_conditions.is_squad_friend_to_actor",
  (actor: GameObject, object: GameObject, [squadStoryId]: [Optional<TStringId>]): boolean => {
    if (squadStoryId) {
      const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

      return squad ? isAnySquadMemberFriendToActor(squad) : false;
    } else {
      return false;
    }
  }
);

/**
 * Check whether squads are enemy to actor.
 *
 * @param params - list of story IDs to check for enemy relation
 */
extern(
  "xr_conditions.is_squad_enemy_to_actor",
  (actor: GameObject, object: GameObject, params: Array<TStringId>): boolean => {
    for (const squadStoryId of params) {
      const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

      if (squad && isAnySquadMemberEnemyToActor(squad)) {
        return true;
      }
    }

    return false;
  }
);

/**
 * Check if object is in combat and fighting actor.
 */
extern("xr_conditions.fighting_actor", (actor: GameObject, object: GameObject): boolean => {
  return registry.objects.get(object.id()).enemyId === ACTOR_ID;
});

/**
 * Checks if object has enemy relations with actor.
 */
extern("xr_conditions.actor_enemy", (actor: GameObject, object: GameObject): boolean => {
  const state: Optional<ISchemeDeathState> = registry.objects.get(object.id())[EScheme.DEATH] as ISchemeDeathState;

  return object.relation(actor) === EGameObjectRelation.ENEMY || state?.killerId === actor.id();
});

/**
 * Checks if object has friendly relations with actor.
 */
extern("xr_conditions.actor_friend", (actor: GameObject, object: GameObject): boolean => {
  return object.relation(actor) === EGameObjectRelation.FRIEND;
});

/**
 * Checks if object has neutral relations with actor.
 */
extern("xr_conditions.actor_neutral", (actor: GameObject, object: GameObject): boolean => {
  return object.relation(actor) === EGameObjectRelation.NEUTRAL;
});

/**
 * Check if object community matches provided parameter.
 */
extern(
  "xr_conditions.npc_community",
  (actor: GameObject, object: AnyGameObject, [community]: [Optional<TCommunity>]): boolean => {
    if (community === null) {
      abort("Wrong number of params in npc_community");
    }

    // Just verify client object.
    if (type(object.id) === "function") {
      return getObjectCommunity(object as GameObject) === community;
    }

    // Try to use registry client object or fallback to server object check.
    return getObjectCommunity(registry.objects.get((object as ServerObject).id)?.object ?? object) === community;
  }
);
