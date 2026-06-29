import { relation_registry } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { Squad } from "@/engine/core/objects/squad";
import { getSquadCommunityRelationToActor } from "@/engine/core/utils/relation/relation_get";
import { EGoodwill, ERelation } from "@/engine/core/utils/relation/relation_types";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { GameObject, Optional, TCount, TRate, TStringId } from "@/engine/lib/types";

/**
 * Check whether is enemy with faction.
 *
 * @param faction - Target faction to check.
 * @param actor - Optional actor object override.
 * @returns Whether actor is enemy with faction.
 */
export function isActorEnemyWithFaction(faction: TCommunity, actor: GameObject = registry.actor): boolean {
  return relation_registry.community_goodwill(faction, actor.id()) <= EGoodwill.ENEMIES;
}

/**
 * Check whether is friend with faction.
 *
 * @param faction - Target faction to check.
 * @param actor - Optional actor object override.
 * @returns Whether actor is friend with faction.
 */
export function isActorFriendWithFaction(faction: TCommunity, actor: GameObject = registry.actor): boolean {
  return relation_registry.community_goodwill(faction, actor.id()) >= EGoodwill.FRIENDS;
}

/**
 * Check whether is neutral with faction.
 *
 * @param faction - Target faction to check.
 * @param actor - Optional actor object override.
 * @returns Whether actor is neutral with faction.
 */
export function isActorNeutralWithFaction(faction: TCommunity, actor: GameObject = registry.actor): boolean {
  const goodwill: TCount = relation_registry.community_goodwill(faction, actor.id());

  return goodwill > EGoodwill.ENEMIES && goodwill < EGoodwill.FRIENDS;
}

/**
 * Check whether squad is enemy to actor.
 *
 * @param squadStoryId - Squad story id.
 * @returns Whether actor is enemy to squad.
 */
export function isSquadCommunityEnemyToActor(squadStoryId: TStringId): boolean {
  return getSquadCommunityRelationToActor(squadStoryId) === ERelation.ENEMY;
}

/**
 * Check whether squad is friend to actor.
 *
 * @param squadStoryId - Squad story id.
 * @returns Whether actor is friend to squad.
 */
export function isSquadCommunityFriendToActor(squadStoryId: TStringId): boolean {
  return getSquadCommunityRelationToActor(squadStoryId) === ERelation.FRIEND;
}

/**
 * Check whether squad is neutral to actor.
 *
 * @param squadStoryId - Squad story id.
 * @returns Whether actor is neutral to squad.
 */
export function isSquadCommunityNeutralToActor(squadStoryId: TStringId): boolean {
  return getSquadCommunityRelationToActor(squadStoryId) === ERelation.NEUTRAL;
}

/**
 * Check general goodwill level between factions and assume whether they are friends.
 *
 * @param from - Community relation check from.
 * @param to - Community relation check to.
 * @returns Whether faction `from` considers `to` friend.
 */
export function areCommunitiesFriendly(from: Optional<TCommunity>, to: TCommunity): boolean {
  if (from && from !== communities.none && to !== communities.none) {
    return relation_registry.community_relation(from, to) >= EGoodwill.FRIENDS;
  } else {
    return false;
  }
}

/**
 * Check general goodwill level between factions and assume whether they are neutral.
 *
 * @param from - Community relation check from.
 * @param to - Community relation check to.
 * @returns Whether faction `from` considers `to` neutral.
 */
export function areCommunitiesNeutral(from: Optional<TCommunity>, to: TCommunity): boolean {
  if (from && from !== communities.none && to !== communities.none) {
    const relation: TRate = relation_registry.community_relation(from, to);

    return relation > EGoodwill.ENEMIES && relation < EGoodwill.FRIENDS;
  } else {
    return false;
  }
}

/**
 * Check general goodwill level between factions and assume whether they are enemies.
 *
 * @param from - Community relation check from.
 * @param to - Community relation check to.
 * @returns Whether faction `from` considers `to` enemy.
 */
export function areCommunitiesEnemies(from: Optional<TCommunity>, to: TCommunity): boolean {
  if (from && from !== communities.none && to !== communities.none) {
    return relation_registry.community_relation(from, to) <= EGoodwill.ENEMIES;
  } else {
    return false;
  }
}

/**
 * Check if anyone from squad is enemy to actor.
 *
 * @param squad - Target squad to check.
 * @returns Whether any member is enemy to actor.
 */
export function isAnySquadMemberEnemyToActor(squad: Squad): boolean {
  for (const squadMember of squad.squad_members()) {
    if (relation_registry.get_general_goodwill_between(squadMember.id, ACTOR_ID) <= EGoodwill.ENEMIES) {
      return true;
    }
  }

  return false;
}

/**
 * Check if anyone from squad is friend to actor.
 *
 * @param squad - Target squad to check.
 * @returns Whether any member is friend to actor.
 */
export function isAnySquadMemberFriendToActor(squad: Squad): boolean {
  for (const squadMember of squad.squad_members()) {
    if (relation_registry.get_general_goodwill_between(squadMember.id, ACTOR_ID) >= EGoodwill.FRIENDS) {
      return true;
    }
  }

  return false;
}
