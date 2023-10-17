import { relation_registry } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { Squad } from "@/engine/core/objects/server/squad";
import { getSquadCommunityRelationToActor } from "@/engine/core/utils/relation/relation_get";
import { EGoodwill, ERelation } from "@/engine/core/utils/relation/relation_types";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { GameObject, Optional, TCount, TStringId } from "@/engine/lib/types";

/**
 * Check whether is enemy with faction.
 *
 * @param faction - target faction to check
 * @param actor - optional actor object override
 * @returns whether actor is enemy with faction
 */
export function isActorEnemyWithFaction(faction: TCommunity, actor: GameObject = registry.actor): boolean {
  return relation_registry.community_goodwill(faction, actor.id()) <= EGoodwill.ENEMIES;
}

/**
 * Check whether is friend with faction.
 *
 * @param faction - target faction to check
 * @param actor - optional actor object override
 * @returns whether actor is friend with faction
 */
export function isActorFriendWithFaction(faction: TCommunity, actor: GameObject = registry.actor): boolean {
  return relation_registry.community_goodwill(faction, actor.id()) >= EGoodwill.FRIENDS;
}

/**
 * Check whether is neutral with faction.
 *
 * @param faction - target faction to check
 * @param actor - optional actor object override
 * @returns whether actor is neutral with faction
 */
export function isActorNeutralWithFaction(faction: TCommunity, actor: GameObject = registry.actor): boolean {
  const goodwill: TCount = relation_registry.community_goodwill(faction, actor.id());

  return goodwill > EGoodwill.ENEMIES && goodwill < EGoodwill.FRIENDS;
}

/**
 * Check whether squad is enemy to actor.
 *
 * @param squadStoryId - squad story id
 * @returns whether actor is enemy to squad
 */
export function isSquadCommunityEnemyToActor(squadStoryId: TStringId): boolean {
  return getSquadCommunityRelationToActor(squadStoryId) === ERelation.ENEMY;
}

/**
 * Check whether squad is friend to actor.
 *
 * @param squadStoryId - squad story id
 * @returns whether actor is friend to squad
 */
export function isSquadCommunityFriendToActor(squadStoryId: TStringId): boolean {
  return getSquadCommunityRelationToActor(squadStoryId) === ERelation.FRIEND;
}

/**
 * Check whether squad is neutral to actor.
 *
 * @param squadStoryId - squad story id
 * @returns whether actor is neutral to squad
 */
export function isSquadCommunityNeutralToActor(squadStoryId: TStringId): boolean {
  return getSquadCommunityRelationToActor(squadStoryId) === ERelation.NEUTRAL;
}

/**
 * Check general goodwill level between factions and assume whether they are friends.
 *
 * @param from - community relation check from
 * @param to - community relation check to
 * @returns whether faction `from` considers `to` friend
 */
export function areCommunitiesFriendly(from: Optional<TCommunity>, to: TCommunity): boolean {
  if (from !== null && from !== communities.none && to !== communities.none) {
    return relation_registry.community_relation(from, to) >= EGoodwill.FRIENDS;
  } else {
    return false;
  }
}

/**
 * Check general goodwill level between factions and assume whether they are enemies.
 *
 * @param from - community relation check from
 * @param to - community relation check to
 * @returns whether faction `from` considers `to` enemy
 */
export function areCommunitiesEnemies(from: Optional<TCommunity>, to: TCommunity): boolean {
  if (from !== null && from !== communities.none && to !== communities.none) {
    return relation_registry.community_relation(from, to) <= EGoodwill.ENEMIES;
  } else {
    return false;
  }
}

/**
 * Check if anyone from squad is enemy to actor.
 *
 * @param squad - target squad to check
 * @returns whether any member is enemy to actor
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
 * @param squad - target squad to check
 * @returns whether any member is friend to actor
 */
export function isAnySquadMemberFriendToActor(squad: Squad): boolean {
  for (const squadMember of squad.squad_members()) {
    if (relation_registry.get_general_goodwill_between(squadMember.id, ACTOR_ID) >= EGoodwill.FRIENDS) {
      return true;
    }
  }

  return false;
}
