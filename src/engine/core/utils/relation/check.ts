import { relation_registry } from "xray16";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects";
import { getSquadCommunityRelationToActor } from "@/engine/core/utils/relation/relation";
import { EGoodwill, ERelation } from "@/engine/core/utils/relation/types";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ClientObject, Optional, TName, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export function isSquadEnemyToActor(storyId: TStringId): boolean {
  return getSquadCommunityRelationToActor(storyId) === ERelation.ENEMY;
}

/**
 * todo;
 */
export function isSquadFriendToActor(storyId: TStringId): boolean {
  return getSquadCommunityRelationToActor(storyId) === ERelation.FRIEND;
}

/**
 * todo;
 */
export function isSquadNeutralToActor(storyId: TName): boolean {
  return getSquadCommunityRelationToActor(storyId) === ERelation.NEUTRAL;
}

/**
 * todo;
 */
export function isFactionsFriends(faction: Optional<TCommunity>, factionTo: TCommunity): boolean {
  if (faction !== null && faction !== communities.none && factionTo !== communities.none) {
    return relation_registry.community_relation(faction, factionTo) >= EGoodwill.FRIENDS;
  } else {
    return false;
  }
}

/**
 * todo;
 */
export function isFactionsEnemies(faction: Optional<TCommunity>, factionTo: TCommunity): boolean {
  if (faction !== null && faction !== communities.none && factionTo !== communities.none) {
    return relation_registry.community_relation(faction, factionTo) <= EGoodwill.ENEMIES;
  } else {
    return false;
  }
}

/**
 * Is enemy any squad member.
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
 * todo;
 */
export function isSquadRelationBetweenActorAndRelation(squadName: TName, relation: ERelation): boolean {
  const squad: Optional<Squad> = getServerObjectByStoryId(squadName);
  const actor: Optional<ClientObject> = registry.actor;

  if (!squad || !actor) {
    return false;
  }

  for (const squadMember of squad.squad_members()) {
    let isEnemy: boolean;

    if (relation === ERelation.ENEMY) {
      const goodwill: Optional<number> = registry.objects.get(squadMember.id)?.object.general_goodwill(actor);

      isEnemy = goodwill === null ? false : goodwill <= EGoodwill.ENEMIES;
    } else {
      const goodwill: Optional<number> = registry.objects.get(squadMember.id)?.object.general_goodwill(actor);

      isEnemy = goodwill === null ? false : goodwill >= EGoodwill.ENEMIES;
    }

    if (isEnemy) {
      return true;
    }
  }

  return false;
}
